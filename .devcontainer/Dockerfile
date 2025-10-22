FROM mcr.microsoft.com/devcontainers/typescript-node:24

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*