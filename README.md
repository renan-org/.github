# .github

Repository containing organization-wide GitHub configurations and workflow templates.

## Repository Structure

This is an organization-level `.github` repository that provides default configurations for all repositories in the `renan-org` organization.

### Directory Layout

```
.github/ (repository root)
├── .github/                          # GitHub configurations for this repository
│   ├── ISSUE_TEMPLATE/               # Issue template configurations
│   │   ├── config.yml                # Issue template chooser configuration
│   │   ├── admin-request.yml         # Admin request issue template
│   │   ├── request-migration.yml     # Repository migration request template
│   │   ├── request-repo.yml          # Repository creation request template
│   │   └── request-team.yml          # Team creation request template
│   ├── workflows/                    # Workflows for this repository
│   │   ├── admin-team.yml
│   │   ├── create-repo.yml
│   │   ├── create-team.yml
│   │   ├── demo-workflow.yml
│   │   ├── manage-github-team.yml
│   │   └── migrate-repo.yml
│   ├── copilot-instructions.md       # Copilot AI instructions
│   └── scripts/                      # Helper scripts
├── workflow-templates/               # Reusable workflow templates for other repos
├── workflows/                        # Required organization-wide workflows
├── profile/                          # Organization profile (public README)
└── README.md                         # This file
```

**Note:** This repository is named `.github`, and like any GitHub repository, it has a `.github/` directory within it for its own GitHub configurations. The nested structure is intentional and follows GitHub's standard repository layout.

### Issue Template Configuration

**Location:** `.github/ISSUE_TEMPLATE/config.yml`

The `config.yml` file configures the GitHub issue template chooser. It should be located in:
```
.github/ISSUE_TEMPLATE/config.yml
```

This file controls:
- Whether blank issues are enabled (`blank_issues_enabled`)
- External contact links for support (`contact_links`)

**Example:**
```yaml
blank_issues_enabled: false
contact_links:
  - name: Community Support
    url: https://community.example.com
    about: Ask questions here
```

### How This Repository Works

As an organization-level `.github` repository, the configurations here apply to all repositories in the organization by default, unless overridden by repository-specific configurations.

## Main Content
- Workflow Templates
- Copilot Instructions
- Issue Templates
- Organization Profile
