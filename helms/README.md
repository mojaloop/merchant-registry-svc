## Helm Charts Deployment

### Default Ingress DNS (add following records to the `/etc/hosts` file)
   - www.acquirer-merchant.local

### Prerequisites

- Kubernetes cluster
- Helm 3
- SendGrid API Key (for sending verification emails)
  - Update the `sendgridApiKey` in the `./chart-acquirer-backend/values.yaml`
  - Update the `senderEmail` in the `./chart-acquirer-backend/values.yaml`

- Register for Google reCAPTCHA v2 and Add Ingress Domain
  - https://www.google.com/recaptcha/admin/create
  - Update the `./chart-acquirer-backend/values.yaml` file with the following values:
    - `recaptchaBackendSiteKey`
  - Update the `./chart-acquirer-frontend/values.yaml` file with the following values:
    - `recaptchaFrontendSiteKey`

### Deploying the Helm Charts

1. Build Dependency Chart

```bash
helm dependency build <rootProject>/helms
```

2. Install the Helm chart:

```bash
helm install my-release <rootProject>/helms
```


### IMPORTANT NOTES:

When updating ingress's host make sure to update the `apiUrl` of `./chart-acquirer-frontend/values.yaml` file too.
Otherwise frontend will not be able to communicate with backend.
