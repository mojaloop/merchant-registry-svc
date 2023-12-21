## Helm Charts Deployment

### Prerequisites

- Kubernetes cluster
- Helm 3

### Deploying the Helm Charts

1. Install the Helm chart:

```bash
helm install my-release <rootProject>/helms
```

2. Default Ingress DNS (add following records to the `/etc/hosts` file)
    - www.acquirer-merchant.local
    - api.acquirer-merchant.local
    - oracle.acquirer-merchant.local

