#!/bin/bash
#set -x

# The root directory of packages to publish
ROOT="./packages"
REPOSITORY_TYPE="github"
# Move to circleCi file
DOCKER_BUILD_PLATFORMS=linux/amd64,linux/arm64
DOCKER_LATEST_RELEASE_NAME=snapshot

# Keep track of packages description that were published
CHANGES_DESCRIPTION=""
TAG_NAME_PARTS=""

########################################################################################
## 1. Setup
########################################################################################
# load common functions
source .circleci/publish_common_functions.sh

# load commits and git change history
printHeader "Phase 1 - Setup"
testEnv
loadCommits

if [[ -z "$COMMITS_SINCE_LAST_CI_BUILD" ]]; then
    echo -e "\nNo commits between last successful CI Build and this one found - exiting"
    exit 0
else
    echo -e "\nCommits between last successful CI Build and this one:\n${COMMITS_SINCE_LAST_CI_BUILD}"
fi

# detect changes
printHeader "Phase 2 - Detecting changed packages since last CI build"
detectChangedPackages

if [[ $CHANGED_PACKAGES_COUNT -le 0 ]]; then
    echo -e "\nDONE - Didn't find any changed packages, all done."
    exit 0
fi


########################################################################################
## Phase 3 - Publishing changed packages to NPM
########################################################################################
printHeader "Phase 3 - Publishing changed packages to NPM"

PUBLISHED_NPM_PACKAGES_COUNT=0

for PACKAGE in ${CHANGED_PACKAGES}; do
    echo -e "\n------------------------------------------------------------"
    echo -e "Processing package: ${PACKAGE}..."

    PACKAGE_PATH=${ROOT}/$PACKAGE
    PACKAGE_NAME=$(cat ${PACKAGE_PATH}/package.json | jq -r ".name")
    PACKAGE_CUR_VERSION=$(cat ${PACKAGE_PATH}/package.json | jq -r ".version")
    PACKAGE_IS_PRIVATE=$(cat $PACKAGE_PATH/package.json | jq -r ".private // false")

    echo -e "\tName: \t\t${PACKAGE_NAME}"
    echo -e "\tPrivate: \t${PACKAGE_IS_PRIVATE}"
    echo -e "\tCur version: \t${PACKAGE_CUR_VERSION}"

    if [[ "$PACKAGE_IS_PRIVATE" = "true" ]]; then
        echo -e "\n\tIGNORING private package"
        continue
    fi

    ## increase patch version only
    npm -w ${PACKAGE_NAME} version patch --no-git-tag-version --no-workspaces-update >/dev/null 2>&1

    PACKAGE_NEW_VERSION=$(cat ${PACKAGE_PATH}/package.json | jq -r ".version")

    echo -e "\tNew version: \t${PACKAGE_NEW_VERSION}"

    echo -e "\n\tBuilding..."
    npm -w ${PACKAGE_NAME} run build
    echo -e "\n\tBuilding completed"

    if [[ -n "$DRYRUN" ]]; then
        echo -e "\nDryrun env var found - not actually publishing to NPM"
        continue
    fi

    echo -e "Publishing..."

    echo -e "---------------- PUBLISH START ----------------------\n"
    # PoC: NPM publishing disabled while testing Docker image signing
    echo "PoC: Skipping NPM publish for ${PACKAGE_NAME}"
    PUB_SUCCESS=0
    echo -e "\n----------------- PUBLISH END -----------------------"

    if [[ $PUB_SUCCESS -eq 0 ]]; then
        PUBLISHED_NPM_PACKAGES_COUNT=$((PUBLISHED_NPM_PACKAGES_COUNT + 1))
        echo -e "Successfully published package."
    else
        echo -e "Error publishing package: ${PACKAGE} - exiting"
        exit 1
    fi
done

if [[ -n "$DRYRUN" ]]; then
    echo -e "\nDryrun env var found - stopping script execution before 'Pushing commits to git'"
    exit 0
fi


########################################################################################
## Phase 4 - Building docker images and publishing to DockerHub
########################################################################################
printHeader "Phase 4 - Building docker images and publishing to DockerHub"

PUBLISHED_DOCKERHUB_PACKAGES_COUNT=0

echo -e "  Docker version: $(docker --version)"
echo -e "  Logging in to dockerhub..."
echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
echo -e "  Create docker builder, bootstrap it and use it..."
docker buildx create --name mybuilder --use --bootstrap
docker buildx ls

echo -e "\nGoing to build and publish ${PACKAGES_TO_PUBLISH_TO_DOCKER_COUNT} package(s)..."

SHORT_GIT_HASH=$(echo $CIRCLE_SHA1 | cut -c -7)

for PACKAGE in ${CHANGED_PACKAGES}; do
    echo -e "\n------------------------------------------------------------"
    echo -e "Processing package: ${PACKAGE}..."

    PACKAGE_PATH=${ROOT}/$PACKAGE
    PACKAGE_NAME=$(cat ${PACKAGE_PATH}/package.json | jq -r ".name")
    DOCKER_IMAGE_NAME="yxxx00/$(echo "$PACKAGE_NAME" | sed -e 's|@mojaloop/||')"
    PACKAGE_CUR_VERSION=$(cat ${PACKAGE_PATH}/package.json | jq -r ".version")
    PACKAGE_PUBLISH_FLAG=$(cat $PACKAGE_PATH/package.json | jq -r ".mojaloop.publish_to_dockerhub // false")

    echo -e "\tName: \t\t${PACKAGE_NAME}"
    echo -e "\tCur version: \t${PACKAGE_CUR_VERSION}"
    echo -e "\tPublish flag: \t${PACKAGE_PUBLISH_FLAG}"

    if [[ ! "$PACKAGE_PUBLISH_FLAG" = "true" ]]; then
        echo -e "\n\tIGNORING package without 'mojaloop.publish_to_dockerhub' flag set to 'true' in package.json"
        continue
    fi

    ## increase patch version only
    npm -w ${PACKAGE_NAME} version patch --no-git-tag-version --no-workspaces-update >/dev/null 2>&1

    PACKAGE_NEW_VERSION=$(cat ${PACKAGE_PATH}/package.json | jq -r ".version")
    DOCKER_TAG_PREV_VERSION=${DOCKER_IMAGE_NAME}:${PACKAGE_CUR_VERSION}
    DOCKER_TAG_VERSION=${DOCKER_IMAGE_NAME}:${PACKAGE_NEW_VERSION}
    DOCKER_TAG_SHORT_GIT_HASH=${DOCKER_IMAGE_NAME}:${SHORT_GIT_HASH}
    DOCKER_TAG_LATEST_RELEASE=${DOCKER_IMAGE_NAME}:${DOCKER_LATEST_RELEASE_NAME}

    echo -e "\tNew version: \t${PACKAGE_NEW_VERSION}"
    echo -e "\tVersion Tag: \t${DOCKER_TAG_VERSION}"
    echo -e "\tCommit Tag: \t${DOCKER_TAG_SHORT_GIT_HASH}"
    echo -e "\tRelease Tag: \t${DOCKER_TAG_LATEST_RELEASE}"

    if [[ -n "$DRYRUN" ]]; then
        echo -e "\nDryrun env var found - not actually building and publishing docker image"
        continue
    fi

    echo -e "\n\tBuilding and publishing docker image..."

    echo -e "---------------- DOCKER BUILD AND PUBLISH START ----------------------\n"

#    docker buildx build --platform ${DOCKER_BUILD_PLATFORMS} --cache-from=${DOCKER_TAG_LATEST_RELEASE} \
    docker buildx build --progress plain --platform ${DOCKER_BUILD_PLATFORMS} --push \
        --cache-from=${DOCKER_TAG_PREV_VERSION} \
        -f ${PACKAGE_PATH}/Dockerfile \
        -t ${DOCKER_TAG_VERSION} -t ${DOCKER_TAG_SHORT_GIT_HASH} -t ${DOCKER_TAG_LATEST_RELEASE} \
        .

    BUILD_AND_PUB_SUCCESS=$?
    echo -e "\n---------------- DOCKER BUILD AND PUBLISH END ----------------------"

    if [[ BUILD_AND_PUB_SUCCESS -eq 0 ]]; then
        PUBLISHED_DOCKERHUB_PACKAGES_COUNT=$((PUBLISHED_DOCKERHUB_PACKAGES_COUNT + 1))
        TAG_NAME_PARTS+="${PACKAGE_NAME}-${PACKAGE_NEW_VERSION},"
        echo -e "Successfully published docker image."
        echo -e "Getting immutable Docker image digest..."

        DIGEST=$(docker buildx imagetools inspect "${DOCKER_TAG_VERSION}" \
        | awk '/^Digest:/ {print $2; exit}')

        if [[ -z "$DIGEST" ]]; then
            echo "Failed to obtain Docker image digest"
            exit 1
        fi

        IMAGE_DIGEST="${DOCKER_IMAGE_NAME}@${DIGEST}"

        echo "Image digest: ${IMAGE_DIGEST}"

        echo "Installing and verifying Cosign..."

        COSIGN_VERSION="v3.1.3"

        # Verification flow adapted from the official
        # sigstore/cosign-installer implementation.
        BOOTSTRAP_VERSION="v3.0.6"
        BOOTSTRAP_SHA256="c956e5dfcac53d52bcf058360d579472f0c1d2d9b69f55209e256fe7783f4c74"
        RELEASE_KEY_SHA256="f4cea466e5e887a45da5031757fa1d32655d83420639dc1758749b744179f126"

        WORKDIR="$(mktemp -d)"

        echo "Downloading Cosign bootstrap ${BOOTSTRAP_VERSION}..."

        curl --retry 3 \
            --proto '=https' \
            --proto-redir '=https' \
            --tlsv1.2 \
            -fsSL \
            "https://github.com/sigstore/cosign/releases/download/${BOOTSTRAP_VERSION}/cosign-linux-amd64" \
            -o "${WORKDIR}/cosign-bootstrap"

        BOOTSTRAP_ACTUAL_SHA256="$(
            sha256sum "${WORKDIR}/cosign-bootstrap" | awk '{print $1}'
        )"

        if [[ "$BOOTSTRAP_ACTUAL_SHA256" != "$BOOTSTRAP_SHA256" ]]; then
            echo "ERROR: Cosign bootstrap SHA256 verification failed"
            rm -rf "$WORKDIR"
            exit 1
        fi

        chmod +x "${WORKDIR}/cosign-bootstrap"

        echo "Cosign bootstrap SHA256 verified."

        echo "Downloading Cosign ${COSIGN_VERSION}..."

        curl --retry 3 \
            --proto '=https' \
            --proto-redir '=https' \
            --tlsv1.2 \
            -fsSL \
            "https://github.com/sigstore/cosign/releases/download/${COSIGN_VERSION}/cosign-linux-amd64" \
            -o "${WORKDIR}/cosign"

        echo "Downloading Cosign release public key..."

        curl --retry 3 \
            --proto '=https' \
            --proto-redir '=https' \
            --tlsv1.2 \
            -fsSL \
            "https://raw.githubusercontent.com/sigstore/cosign/${COSIGN_VERSION}/release/release-cosign.pub" \
            -o "${WORKDIR}/release-cosign.pub"

        RELEASE_KEY_ACTUAL_SHA256="$(
            sha256sum "${WORKDIR}/release-cosign.pub" | awk '{print $1}'
        )"

        if [[ "$RELEASE_KEY_ACTUAL_SHA256" != "$RELEASE_KEY_SHA256" ]]; then
            echo "ERROR: Cosign release public key SHA256 verification failed"
            rm -rf "$WORKDIR"
            exit 1
        fi

        echo "Cosign release public key verified."

        echo "Verifying Cosign keyless Sigstore bundle..."

        curl --retry 3 \
            --proto '=https' \
            --proto-redir '=https' \
            --tlsv1.2 \
            -fsSL \
            "https://github.com/sigstore/cosign/releases/download/${COSIGN_VERSION}/cosign-linux-amd64.sigstore.json" \
            -o "${WORKDIR}/cosign-linux-amd64.sigstore.json"

        "${WORKDIR}/cosign-bootstrap" verify-blob \
            --certificate-identity="keyless@projectsigstore.iam.gserviceaccount.com" \
            --certificate-oidc-issuer="https://accounts.google.com" \
            --bundle "${WORKDIR}/cosign-linux-amd64.sigstore.json" \
            "${WORKDIR}/cosign"

        echo "Keyless Sigstore bundle verified."

        echo "Verifying Cosign KMS-backed Sigstore bundle..."

        curl --retry 3 \
            --proto '=https' \
            --proto-redir '=https' \
            --tlsv1.2 \
            -fsSL \
            "https://github.com/sigstore/cosign/releases/download/${COSIGN_VERSION}/cosign-linux-amd64-kms.sigstore.json" \
            -o "${WORKDIR}/cosign-linux-amd64-kms.sigstore.json"

        "${WORKDIR}/cosign-bootstrap" verify-blob \
            --key "${WORKDIR}/release-cosign.pub" \
            --bundle "${WORKDIR}/cosign-linux-amd64-kms.sigstore.json" \
            "${WORKDIR}/cosign"

        echo "KMS-backed Sigstore bundle verified."
        echo "Cosign binary successfully verified."

        sudo install "${WORKDIR}/cosign" /usr/local/bin/cosign

        rm -rf "$WORKDIR"

        cosign version

        echo "Preparing CircleCI OIDC token for keyless signing..."

        echo "CircleCI environment CLI version:"
        circleci version
        
        SIGSTORE_ID_TOKEN="$(circleci run oidc get --claims '{"aud":"sigstore"}')"

        if [[ -z "$SIGSTORE_ID_TOKEN" ]]; then
            echo "ERROR: Failed to obtain CircleCI OIDC token"
            exit 1
        fi

        export SIGSTORE_ID_TOKEN

        echo "Signing Docker image keylessly: ${IMAGE_DIGEST}"

        cosign sign \
            --yes \
            "$IMAGE_DIGEST"

        unset SIGSTORE_ID_TOKEN

        echo "Successfully signed Docker image using CircleCI OIDC."

        CHANGES_DESCRIPTION="${CHANGES_DESCRIPTION} - [${PACKAGE}-${PACKAGE_NEW_VERSION}]"
    else
        echo -e "Error publishing package: ${PACKAGE} - exiting"
        exit 1
    fi
done

if [[ -n "$DRYRUN" ]]; then
    echo -e "\nDryrun env var found - stopping script execution before 'Pushing commits to git'"
    exit 0
fi

echo "PoC Docker signing test completed - skipping git commit/tag/push."
exit 0

############################################
## Phase 5 - Pushing combined commit to git
############################################
printHeader "Phase 5 - Pushing single combined commit and tag to git"

# Stage all changes
git add -A

# Commit with a combined message
COMMIT_MESSAGE="[ci skip] auto commit for packages - ${CHANGES_DESCRIPTION}"
git commit --no-verify -m "$COMMIT_MESSAGE"

# Create a single tag. Example uses date and time for uniqueness.
TAG_NAME="${TAG_NAME_PARTS%,}" # Removes the trailing comma
git tag $TAG_NAME

if [[ PUBLISHED_NPM_PACKAGES_COUNT -eq 0 ]] && [[ PUBLISHED_DOCKERHUB_PACKAGES_COUNT -eq 0 ]]; then
    echo -e "No Packages were published, nothing to push to git"
    exit 0
fi

echo -e "Pulling latest changes from this pipeline..."
git pull
echo -e "Pushing changes..."
# git status
git push -f origin $CIRCLE_BRANCH --tags

if [[ ! $? -eq 0 ]]; then
    echo -e "Error pushing CI/CD auto commits for version changes - exiting"
    exit 5
fi

TOTAL_PUBLISHED_COUNT=$((PUBLISHED_NPM_PACKAGES_COUNT + PUBLISHED_DOCKERHUB_PACKAGES_COUNT))

echo -e "\nDONE - ${TOTAL_PUBLISHED_COUNT} package(s) were published and version changes pushed, all done."

