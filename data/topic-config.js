window.TOPIC_CONFIG = {
  "aws.html": {
    "label": "AWS",
    "topology": "AWS Organization\n  |\n  +-- Security Account\n  +-- Shared Services Account\n  +-- Prod Account (VPC-Prod)\n  +-- NonProd Account (VPC-Dev)",
    "examples": {
      "sec-1": {
        "title": "AWS Example - Secure VPC Baseline",
        "lang": "Terraform",
        "code": "resource \"aws_vpc\" \"prod\" {\n  cidr_block           = \"10.20.0.0/16\"\n  enable_dns_support   = true\n  enable_dns_hostnames = true\n\n  tags = {\n    Name        = \"vpc-prod-core\"\n    Environment = \"prod\"\n    Owner       = \"platform-team\"\n  }\n}\n\nresource \"aws_subnet\" \"app_private_a\" {\n  vpc_id            = aws_vpc.prod.id\n  cidr_block        = \"10.20.10.0/24\"\n  availability_zone = \"eu-central-1a\"\n\n  tags = {\n    Name = \"subnet-app-private-a\"\n    Tier = \"app\"\n  }\n}\n\nresource \"aws_security_group\" \"app_sg\" {\n  name   = \"sg-app-prod\"\n  vpc_id = aws_vpc.prod.id\n\n  ingress {\n    from_port   = 443\n    to_port     = 443\n    protocol    = \"tcp\"\n    cidr_blocks = [\"10.20.0.0/16\"]\n  }\n}",
        "steps": [
          "Create the VPC first so all resources inherit one controlled network boundary.",
          "Enable DNS support/hostnames to keep service discovery stable across environments.",
          "Define private subnet for application tier and separate it from public exposure.",
          "Attach a least-privilege security group that only allows required traffic (443 in this case).",
          "Tag everything consistently for governance, cost tracking, and incident response."
        ]
      },
      "sec-2": {
        "title": "AWS Example - Route Tables and NACL Segmentation",
        "lang": "Terraform",
        "code": "resource \"aws_route_table\" \"private_rt\" {\n  vpc_id = aws_vpc.prod.id\n\n  route {\n    cidr_block     = \"0.0.0.0/0\"\n    nat_gateway_id = aws_nat_gateway.main.id\n  }\n}\n\nresource \"aws_network_acl\" \"app_acl\" {\n  vpc_id = aws_vpc.prod.id\n\n  ingress {\n    rule_no    = 100\n    protocol   = \"tcp\"\n    action     = \"allow\"\n    cidr_block = \"10.20.0.0/16\"\n    from_port  = 443\n    to_port    = 443\n  }\n\n  egress {\n    rule_no    = 100\n    protocol   = \"-1\"\n    action     = \"allow\"\n    cidr_block = \"0.0.0.0/0\"\n    from_port  = 0\n    to_port    = 0\n  }\n}",
        "steps": [
          "Create dedicated private route table for app subnets.",
          "Send default traffic through NAT instead of direct internet path.",
          "Add explicit NACL entries for controlled ingress and egress.",
          "Keep numbering deterministic to avoid accidental rule overrides.",
          "Associate route table and NACL only where segmentation is required."
        ]
      },
      "sec-3": {
        "title": "AWS Example - Least Privilege IAM Policy",
        "lang": "JSON",
        "code": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"AllowReadTaggedBuckets\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:GetObject\",\n        \"s3:ListBucket\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::prod-app-logs\",\n        \"arn:aws:s3:::prod-app-logs/*\"\n      ],\n      \"Condition\": {\n        \"StringEquals\": {\n          \"aws:ResourceTag/Environment\": \"prod\"\n        }\n      }\n    }\n  ]\n}",
        "steps": [
          "Scope policy to specific bucket resources only.",
          "Allow read-only actions needed by the workload.",
          "Apply tag condition to enforce environment boundaries.",
          "Attach policy to role instead of long-lived user keys.",
          "Validate with IAM Access Analyzer before production rollout."
        ]
      },
      "sec-6": {
        "title": "AWS Advanced - Multi-AZ Failover and Recovery Drill",
        "lang": "Terraform/AWS CLI",
        "code": "resource \"aws_db_subnet_group\" \"prod\" {\n  name       = \"rds-prod-subnet-group\"\n  subnet_ids = [aws_subnet.db_a.id, aws_subnet.db_b.id]\n}\n\nresource \"aws_db_instance\" \"prod\" {\n  identifier              = \"rds-prod-core\"\n  engine                  = \"postgres\"\n  instance_class          = \"db.m6g.large\"\n  allocated_storage       = 200\n  multi_az                = true\n  backup_retention_period = 14\n  storage_encrypted       = true\n  db_subnet_group_name    = aws_db_subnet_group.prod.name\n}\n\n# Drill checks\n# aws rds reboot-db-instance --db-instance-identifier rds-prod-core --force-failover\n# aws rds describe-events --source-identifier rds-prod-core --duration 60",
        "steps": [
          "Deploy database with Multi-AZ enabled and encrypted storage.",
          "Set retention and subnet placement across different AZs.",
          "Run controlled failover drill during maintenance window.",
          "Measure failover duration against RTO target.",
          "Document recovery evidence and required improvements."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "Landing Zone Setup",
        "lang": "AWS CLI",
        "code": "aws organizations list-accounts\naws organizations list-policies --filter SERVICE_CONTROL_POLICY"
      },
      "sec-2": {
        "title": "Network Segmentation",
        "lang": "AWS CLI",
        "code": "aws ec2 describe-vpcs --output table\naws ec2 describe-subnets --output table\naws ec2 describe-route-tables --output table"
      },
      "sec-3": {
        "title": "IAM Baseline",
        "lang": "AWS CLI",
        "code": "aws iam list-roles\naws iam generate-credential-report\naws iam get-account-authorization-details"
      },
      "sec-4": {
        "title": "Security Monitoring",
        "lang": "AWS CLI",
        "code": "aws cloudtrail describe-trails\naws guardduty list-detectors\naws securityhub get-enabled-standards"
      },
      "sec-5": {
        "title": "Backup and DR",
        "lang": "AWS CLI",
        "code": "aws backup list-backup-plans\naws rds describe-db-snapshots\naws ec2 describe-snapshots --owner-ids self"
      },
      "sec-6": {
        "title": "IaC Operations",
        "lang": "Terraform",
        "code": "terraform fmt -recursive\nterraform plan -out=tfplan\nterraform apply tfplan\nterraform fmt -recursive\nterraform plan -out=tfplan\nterraform apply tfplan\naws rds describe-db-clusters --db-cluster-identifier prod-cluster\naws rds failover-db-cluster --db-cluster-identifier prod-cluster\naws cloudwatch describe-alarms --state-value ALARM"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "AWS CLI",
        "code": "aws cloudformation list-stacks\naws configservice get-compliance-summary-by-config-rule\naws cloudwatch describe-alarms --state-value ALARM"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "AWS CLI",
        "code": "aws iam get-account-summary\naws ec2 describe-security-groups --query \"SecurityGroups[*].[GroupName,IpPermissions]\"\naws organizations describe-organization"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "AWS CLI",
        "code": "aws ec2 describe-network-interfaces --output table\naws ec2 describe-security-groups --output table\naws ec2 describe-route-tables --output table"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "Terraform/AWS CLI",
        "code": "terraform validate\nterraform plan -detailed-exitcode\naws trustedadvisor describe-trusted-advisor-check-result --check-id <check-id> --language en"
      }
    },
    "explanations": {
      "sec-1": "Ne AWS fillo me account strategy dhe guardrails: Organizations, SCP, tagging policy dhe ndarja e mjediseve prod/non-prod. Qellimi eshte governance e kontrolluar para deploy-ve.",
      "sec-2": "Per rrjetin ne AWS, fokusi eshte VPC segmentation, route tables, NACL dhe Security Groups. Verifiko east-west dhe north-south traffic me flow logs para cutover-it.",
      "sec-3": "Ne IAM, perdor role-based access, least privilege dhe access analyzer. Cdo permission change duhet te lidhet me ticket dhe te kete rollback plan.",
      "sec-4": "Monitorimi ne AWS duhet te kombinoje CloudTrail, CloudWatch dhe GuardDuty. Alert-et kritike kategorizohen sipas impaktit ne disponueshmeri, integritet dhe konfidencialitet.",
      "sec-5": "Resiliency ne AWS kerkon backup strategy per EBS/RDS/S3, multi-AZ dhe teste restore reale. Dokumento RTO/RPO per secilin workload.",
      "sec-6": "Operacionet ne AWS duhet te kalojne permes pipeline te kontrolluar me terraform plan/apply dhe policy checks. Cdo release duhet te kete rollback artifact dhe change log te qarte.",
      "sec-7": "Lab-et per AWS duhet te perfshijne nje rast deployment, nje rast policy enforcement dhe nje rast failure recovery. Suksesi matet me evidenca konkrete nga CLI dhe console.",
      "sec-8": "Ne quiz AWS, pyetjet duhet te testojne vendime arkitekturore si kur perdoret SCP kundrejt IAM policy ose kur nevojitet multi-account isolation.",
      "sec-9": "Kur ka incident ne AWS, fillo me connectivity path (ENI, SG, route), pastaj kontrollo logs dhe policy denies. Mos ndrysho disa gjera paralelisht pa hipoteze te qarte.",
      "sec-10": "Vleresimi final ne AWS duhet te provoje qe kandidati mund te dizajnoje mjedis te sigurt, te automatizuar dhe te rikuperueshem pa shkelur governance standards."
    }
  },
  "azure.html": {
    "label": "Azure",
    "topology": "Management Groups\n  |\n  +-- Platform Subscriptions\n  +-- Landing Zone Subscriptions\n        +-- Hub VNet\n        +-- Spoke VNet App\n        +-- Spoke VNet Data",
    "examples": {
      "sec-1": {
        "title": "Azure Example - Hub-Spoke Network Baseline",
        "lang": "Bicep",
        "code": "resource vnetHub \"Microsoft.Network/virtualNetworks@2023-09-01\" = {\n  name: \"vnet-hub-prod\"\n  location: resourceGroup().location\n  properties: {\n    addressSpace: {\n      addressPrefixes: [\n        \"10.100.0.0/16\"\n      ]\n    }\n    subnets: [\n      {\n        name: \"AzureFirewallSubnet\"\n        properties: {\n          addressPrefix: \"10.100.0.0/24\"\n        }\n      }\n    ]\n  }\n}\n\nresource nsgApp \"Microsoft.Network/networkSecurityGroups@2023-09-01\" = {\n  name: \"nsg-app-prod\"\n  location: resourceGroup().location\n  properties: {\n    securityRules: [\n      {\n        name: \"Allow443FromHub\"\n        properties: {\n          priority: 200\n          direction: \"Inbound\"\n          access: \"Allow\"\n          protocol: \"Tcp\"\n          sourceAddressPrefix: \"10.100.0.0/16\"\n          destinationPortRange: \"443\"\n          sourcePortRange: \"*\"\n          destinationAddressPrefix: \"*\"\n        }\n      }\n    ]\n  }\n}",
        "steps": [
          "Deploy the hub VNet as shared control plane for connectivity and security services.",
          "Reserve mandatory subnet segments (for example firewall subnet) before workload onboarding.",
          "Create NSG with explicit inbound rule for required app port instead of broad any-any access.",
          "Keep rule priorities deterministic so future changes do not silently override security intent.",
          "Use this baseline as template for each spoke environment (dev, test, prod)."
        ]
      },
      "sec-2": {
        "title": "Azure Example - UDR and NSG for Spoke Isolation",
        "lang": "Bicep",
        "code": "resource rtSpoke 'Microsoft.Network/routeTables@2023-09-01' = {\n  name: 'rt-spoke-app'\n  location: resourceGroup().location\n  properties: {\n    routes: [\n      {\n        name: 'DefaultToFirewall'\n        properties: {\n          addressPrefix: '0.0.0.0/0'\n          nextHopType: 'VirtualAppliance'\n          nextHopIpAddress: '10.100.0.4'\n        }\n      }\n    ]\n  }\n}\n\nresource nsgSpoke 'Microsoft.Network/networkSecurityGroups@2023-09-01' = {\n  name: 'nsg-spoke-app'\n  location: resourceGroup().location\n  properties: {\n    securityRules: [\n      {\n        name: 'Allow443FromHub'\n        properties: {\n          priority: 200\n          direction: 'Inbound'\n          access: 'Allow'\n          protocol: 'Tcp'\n          sourceAddressPrefix: '10.100.0.0/16'\n          destinationPortRange: '443'\n          sourcePortRange: '*'\n          destinationAddressPrefix: '*'\n        }\n      }\n    ]\n  }\n}",
        "steps": [
          "Force spoke default route through central firewall.",
          "Allow only required inbound flow from hub range.",
          "Keep explicit priorities for stable policy behavior.",
          "Attach NSG and route table at subnet level.",
          "Test effective routes and effective security rules after deploy."
        ]
      },
      "sec-3": {
        "title": "Azure Example - RBAC Role Assignment as Code",
        "lang": "Bicep",
        "code": "resource roleAssign 'Microsoft.Authorization/roleAssignments@2022-04-01' = {\n  name: guid(resourceGroup().id, 'app-ops-reader')\n  scope: resourceGroup()\n  properties: {\n    roleDefinitionId: subscriptionResourceId(\n      'Microsoft.Authorization/roleDefinitions',\n      'acdd72a7-3385-48ef-bd42-f606fba81ae7'\n    )\n    principalId: '11111111-2222-3333-4444-555555555555'\n    principalType: 'Group'\n  }\n}",
        "steps": [
          "Use group-based access instead of individual assignments.",
          "Bind Reader role at resource-group scope for least privilege.",
          "Create deterministic name with guid() to avoid duplicates.",
          "Track principal ownership in identity governance process.",
          "Review assignments periodically with access reviews."
        ]
      },
      "sec-6": {
        "title": "Azure Advanced - Zone-Redundant App and Front Door Failover",
        "lang": "Bicep",
        "code": "resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {\n  name: 'asp-prod-zr'\n  location: resourceGroup().location\n  sku: {\n    name: 'P1v3'\n    tier: 'PremiumV3'\n  }\n  properties: {\n    zoneRedundant: true\n  }\n}\n\nresource fd 'Microsoft.Cdn/profiles@2024-02-01' = {\n  name: 'afd-prod-core'\n  location: 'global'\n  sku: { name: 'Standard_AzureFrontDoor' }\n}\n\n// Create origin groups with health probes for active/passive regional failover",
        "steps": [
          "Use zone-redundant App Service plan for intra-region resilience.",
          "Place Front Door in front for global health-based failover.",
          "Configure probe path and strict unhealthy thresholds.",
          "Simulate regional outage by draining primary origin.",
          "Validate cutover timing and session impact."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "Governance Setup",
        "lang": "Azure CLI",
        "code": "az account management-group list -o table\naz policy assignment list -o table\naz role assignment list --all -o table"
      },
      "sec-2": {
        "title": "Hub-Spoke Network",
        "lang": "Azure CLI",
        "code": "az network vnet list -o table\naz network vnet peering list -g rg-net --vnet-name vnet-hub\naz network route-table list -o table"
      },
      "sec-3": {
        "title": "Identity Controls",
        "lang": "Azure CLI",
        "code": "az role definition list --name Reader\naz role assignment list -o table\naz ad signed-in-user show"
      },
      "sec-4": {
        "title": "Posture Monitoring",
        "lang": "Azure CLI",
        "code": "az security pricing list -o table\naz monitor diagnostic-settings list --resource <resource-id>\naz monitor log-analytics workspace list -o table"
      },
      "sec-5": {
        "title": "DR Validation",
        "lang": "Azure CLI",
        "code": "az backup vault list -o table\naz backup item list --resource-group rg-backup --vault-name vault-prod\naz disk list -o table"
      },
      "sec-6": {
        "title": "Automation Pipeline",
        "lang": "Azure CLI",
        "code": "az deployment sub what-if --location westeurope --template-file main.bicep\naz deployment sub create --location westeurope --template-file main.bicep\naz deployment sub what-if --location westeurope --template-file main.bicep\naz deployment sub create --location westeurope --template-file main.bicep\naz network front-door show -g rg-net --name afd-prod-core\naz network front-door health-probe show -g rg-net --front-door-name afd-prod-core\naz network watcher test-connectivity --source-resource vm-app --dest-address 10.100.0.5 --dest-port 443"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "Azure CLI",
        "code": "az policy state summarize -o table\naz monitor metrics list --resource <resource-id> --metric \"Percentage CPU\"\naz network watcher flow-log show -g rg-net -n nsg-flowlog"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "Azure CLI",
        "code": "az role assignment list --all -o table\naz policy assignment list -o table\naz network nsg list -o table"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "Azure CLI",
        "code": "az network watcher test-connectivity --source-resource vm-app --dest-address 10.101.2.4 --dest-port 1433\naz network nic show-effective-route-table -g rg-net -n nic-app"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "Azure CLI/Bicep",
        "code": "az bicep build --file main.bicep\naz deployment sub what-if --location westeurope --template-file main.bicep\naz advisor recommendation list -o table"
      }
    },
    "explanations": {
      "sec-1": "Ne Azure, baza eshte management groups, policy assignments dhe role inheritance. Governance fillon ne nivel tenant/subscription para workload onboarding.",
      "sec-2": "Per topologji Azure, hub-spoke dhe peering duhet te jene te dokumentuara me UDR/NSG rregulla. Validimi behet me effective routes dhe test-connectivity.",
      "sec-3": "Identity model ne Azure duhet te vendose RBAC me scope te sakte dhe PIM per privilegje te larta. Access reviews jane pjese e kontrollit periodik.",
      "sec-4": "Per observability ne Azure, kombino diagnostic settings, Log Analytics dhe alert rules. Standardizo dashboards per NOC dhe SOC qe te shmanget alert fatigue.",
      "sec-5": "DR ne Azure duhet te testoje recovery workflow, jo vetem konfigurim statik. Mat kohen e failover-it dhe krahasoje me objektivat e biznesit.",
      "sec-6": "Operacionet ne Azure duhet te mbeshteten ne Bicep/ARM me what-if para deploy-it. Kjo ul ndryshimet e paparashikuara dhe mban audit trail te sakte.",
      "sec-7": "Lab-et Azure duhet te kalojne nga governance setup, ne network validation, deri te operational incident drill. Cdo hap duhet te perfundoje me prove funksionale.",
      "sec-8": "Quiz ne Azure duhet te testoje kompromiset mes security, cost dhe operational complexity ne skenare reale tenant/subscription.",
      "sec-9": "Troubleshooting ne Azure fillon me DNS, NSG, UDR dhe peering status. Pasi vertetohet network path, kalo ne identity dhe policy constraints.",
      "sec-10": "Provimi final Azure duhet te vertetoje qe kandidati mund te menaxhoje platform governance dhe workload reliability ne te njejten kohe."
    }
  },
  "firepower.html": {
    "label": "Cisco Firepower",
    "topology": "Internet/WAN\n   |\n[Edge Router]\n   |\n[FTD Cluster] <--> [FMC]\n   |\nDMZ --- Inside --- Server Zones",
    "examples": {
      "sec-1": {
        "title": "Firepower Example - Access Control Policy Rule",
        "lang": "FMC Policy Logic",
        "code": "Rule Name: Allow-App-HTTPS\nSource Zone: Inside\nDestination Zone: DMZ\nSource Networks: NET_APP_CLIENTS\nDestination Networks: NET_DMZ_WEB\nApplications: HTTPS\nUsers: AD_GROUP_APP_USERS\nAction: Allow\nIPS Policy: Balanced Security and Connectivity\nFile Policy: Malware-Inspect\nLog at Beginning: true\nLog at End: true",
        "steps": [
          "Define source and destination zones first to ensure rule scope is exact.",
          "Use object groups for networks so policy maintenance is centralized.",
          "Bind application identity (HTTPS) and user group context for zero-trust style control.",
          "Attach IPS/File policies to inspect allowed traffic, not only blocked traffic.",
          "Enable begin/end logging for full traceability during incident investigations."
        ]
      },
      "sec-2": {
        "title": "Firepower Example - ACP Rule Order Pattern",
        "lang": "Policy Design",
        "code": "1) Rule: Deny-Known-Bad\n   Source Zone: Any\n   Destination Zone: Any\n   App: Any\n   URL Category: Malicious\n   Action: Block\n\n2) Rule: Allow-Business-HTTPS\n   Source Zone: Inside\n   Destination Zone: DMZ\n   App: HTTPS\n   User Group: APP_USERS\n   Action: Allow\n   IPS: Balanced\n\n3) Rule: Default-Deny-Log\n   Source Zone: Any\n   Destination Zone: Any\n   App: Any\n   Action: Block + Log",
        "steps": [
          "Place deny rules for high-risk categories at top.",
          "Add business allow rules with tight context below.",
          "Keep default deny as final safeguard with logging.",
          "Avoid overlapping objects that shadow intended rules.",
          "Validate policy hit counts after deployment window."
        ]
      },
      "sec-4": {
        "title": "Firepower Example - NAT and Site-to-Site VPN Baseline",
        "lang": "FTD CLI",
        "code": "object network OBJ_INSIDE\n subnet 10.10.10.0 255.255.255.0\nobject network OBJ_REMOTE\n subnet 172.16.50.0 255.255.255.0\n\nnat (inside,outside) source static OBJ_INSIDE OBJ_INSIDE destination static OBJ_REMOTE OBJ_REMOTE no-proxy-arp route-lookup\n\ncrypto ikev2 policy 10\n encryption aes-256\n integrity sha256\n group 14\n prf sha256\n lifetime seconds 28800",
        "steps": [
          "Define local and remote encryption domains as objects.",
          "Use identity NAT (no-NAT) for VPN interesting traffic.",
          "Set strong IKEv2 policy with deterministic crypto suite.",
          "Match phase2 selectors on both peers exactly.",
          "Validate with sessiondb and packet-tracer before cutover."
        ]
      },
      "sec-6": {
        "title": "Firepower Advanced - HA Pair Failover Validation",
        "lang": "FTD CLI",
        "code": "show failover\nshow failover state\nshow failover history\n\n# Trigger controlled failover from active unit during approved window\nno failover active\n\n# Post-checks\nshow conn count\nshow asp drop\nshow vpn-sessiondb summary",
        "steps": [
          "Confirm both units are healthy and fully synchronized.",
          "Execute controlled failover on approved change window.",
          "Verify stateful session behavior during role switch.",
          "Check drops and VPN session continuity after cutover.",
          "Record timings and rollback readiness."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "FMC Discovery",
        "lang": "FTD CLI",
        "code": "show managers\nshow version\nshow running-config managers"
      },
      "sec-2": {
        "title": "ACP Checks",
        "lang": "FTD CLI",
        "code": "show access-control-config\nshow conn count\nshow asp drop"
      },
      "sec-3": {
        "title": "IPS Visibility",
        "lang": "FTD CLI",
        "code": "show intrusion statistics\nshow service-policy\nshow events"
      },
      "sec-4": {
        "title": "NAT and VPN",
        "lang": "FTD CLI",
        "code": "show nat detail\nshow vpn-sessiondb l2l\nshow crypto ikev2 sa"
      },
      "sec-5": {
        "title": "HA Status",
        "lang": "FTD CLI",
        "code": "show failover\nshow failover history\nshow interface ip brief"
      },
      "sec-6": {
        "title": "Ops Runbook",
        "lang": "FTD CLI",
        "code": "packet-tracer input inside tcp 10.1.10.20 12345 172.16.20.30 443\nshow logging\nshow failover\nshow failover state\nshow failover history\nshow conn count\nshow asp drop\nshow vpn-sessiondb summary"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "FTD CLI",
        "code": "show access-control-config\nshow nat detail\nshow vpn-sessiondb summary"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "FTD CLI",
        "code": "show managers\nshow service-policy\nshow intrusion statistics"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "FTD CLI",
        "code": "show capture\nshow conn address 10.1.10.20\nshow asp drop"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "FTD CLI",
        "code": "show failover\nshow running-config access-group\nshow tech-support"
      }
    },
    "explanations": {
      "sec-1": "Ne Firepower, kontrolli i pare eshte sinkronizimi FMC-FTD, version compatibility dhe health status. Pa kete, policy lifecycle nuk eshte i besueshem.",
      "sec-2": "ACP duhet te dizajnohet me zone-context dhe rule ordering te qarte. Rule shadowing dhe object sprawl jane dy burime te shpeshta gabimesh.",
      "sec-3": "IPS tuning kerkon balancim mes sigurise dhe false positives. Dokumento signatures ne monitor mode para se t'i kalosh ne drop.",
      "sec-4": "NAT dhe VPN ne Firepower duhen validuar me packet-tracer dhe session visibility. Renditja NAT para policy decision shpesh shkakton konfuzion operativ.",
      "sec-5": "HA duhet testuar me failover real dhe verifikim state replication. Kontrollo impaktin ne flows aktive dhe kohe rikthimi.",
      "sec-6": "Runbook Firepower duhet te kete hapa te qarte per deploy policy, verification dhe rollback. Ndryshimet emergjente pa standard operative shpesh rrisin outage risk.",
      "sec-7": "Lab-et Firepower duhet te simulojne policy mismatch, IPS false positive dhe tunnel issue. Qellimi eshte te stërvitet metoda e izolimit te problemit.",
      "sec-8": "Quiz Firepower duhet te vleresoje njohurite per rule order, inspection depth dhe impact ne throughput, jo vetem komandat bazike.",
      "sec-9": "Per incidente ne Firepower, ndiq rrugen: asp-drop, conn table, captures. Ruaj output-et qe RCA te jete i riprodhueshem.",
      "sec-10": "Ne vleresimin final Firepower, kandidati duhet te argumentoje pse nje policy ndryshim eshte i sigurt dhe si minimizohet rreziku operativ."
    }
  },
  "routers.html": {
    "label": "Cisco Routers",
    "topology": "ISP-A ----- [Edge Router A] ----- Core\nISP-B ----- [Edge Router B] ----- Core\n                       |\n                Distribution Layer\n                       |\n                  Access Sites",
    "examples": {
      "sec-1": {
        "title": "Router Example - OSPF + BGP Edge Pattern",
        "lang": "IOS-XE",
        "code": "router ospf 100\n router-id 10.255.255.1\n passive-interface default\n no passive-interface GigabitEthernet0/0\n network 10.10.0.0 0.0.255.255 area 10\n\nrouter bgp 65010\n bgp log-neighbor-changes\n neighbor 203.0.113.1 remote-as 65001\n neighbor 203.0.113.1 description ISP-A\n address-family ipv4\n  network 10.10.0.0 mask 255.255.0.0\n  neighbor 203.0.113.1 route-map OUTBOUND-POLICY out\n exit-address-family",
        "steps": [
          "OSPF handles internal route distribution while BGP manages external ISP exchange.",
          "Use passive-interface default to reduce accidental adjacency exposure.",
          "Advertise only intended internal prefixes to avoid route leaks.",
          "Apply outbound route-map on BGP neighbor for policy and path hygiene.",
          "Keep router-id and neighbor descriptions explicit for easier troubleshooting."
        ]
      },
      "sec-2": {
        "title": "Router Example - OSPF Multi-Area Design",
        "lang": "IOS-XE",
        "code": "router ospf 100\n router-id 10.255.255.1\n passive-interface default\n no passive-interface GigabitEthernet0/0\n no passive-interface GigabitEthernet0/1\n area 0 authentication message-digest\n area 10 stub no-summary\n network 10.10.0.0 0.0.255.255 area 10\n network 10.255.0.0 0.0.0.255 area 0",
        "steps": [
          "Use area 0 for transit and area 10 for branch prefixes.",
          "Set passive by default to reduce unnecessary adjacencies.",
          "Enable area auth for control-plane integrity.",
          "Use stub area to reduce LSDB churn at branch edge.",
          "Monitor SPF and adjacency stability after changes."
        ]
      },
      "sec-3": {
        "title": "Router Example - BGP Route-Map Policy Control",
        "lang": "IOS-XE",
        "code": "ip prefix-list OUTBOUND permit 10.10.0.0/16\nip prefix-list OUTBOUND deny 0.0.0.0/0 le 32\n\nroute-map OUTBOUND-POLICY permit 10\n match ip address prefix-list OUTBOUND\n set community 65010:100 additive\n\nrouter bgp 65010\n neighbor 203.0.113.1 remote-as 65001\n address-family ipv4\n  neighbor 203.0.113.1 route-map OUTBOUND-POLICY out",
        "steps": [
          "Whitelist only intended prefixes for advertisement.",
          "Use route-map to enforce community tagging policy.",
          "Deny all other prefixes explicitly to prevent leaks.",
          "Apply policy outbound on external BGP neighbor.",
          "Verify advertised routes and communities post-change."
        ]
      },
      "sec-6": {
        "title": "Router Advanced - Dual ISP BGP + SLA-Based Failover",
        "lang": "IOS-XE",
        "code": "ip sla 10\n icmp-echo 8.8.8.8 source-interface GigabitEthernet0/0\n frequency 5\nip sla schedule 10 life forever start-time now\ntrack 10 ip sla 10 reachability\n\nroute-map ISP-A-PREF permit 10\n set local-preference 200\n\nroute-map ISP-A-PREF permit 20\n set local-preference 100\n\nrouter bgp 65010\n neighbor 203.0.113.1 route-map ISP-A-PREF in\n neighbor 198.51.100.1 route-map ISP-A-PREF in",
        "steps": [
          "Track upstream health with IP SLA from primary edge.",
          "Use policy to prefer ISP-A when healthy.",
          "Allow automatic path shift when SLA fails.",
          "Test failover and failback under load conditions.",
          "Verify convergence time and packet loss envelope."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "Routing Baseline",
        "lang": "IOS-XE",
        "code": "show ip route summary\nshow ip interface brief\nshow ip protocols"
      },
      "sec-2": {
        "title": "OSPF Health",
        "lang": "IOS-XE",
        "code": "show ip ospf neighbor\nshow ip ospf database\nshow ip ospf interface brief"
      },
      "sec-3": {
        "title": "BGP Policy",
        "lang": "IOS-XE",
        "code": "show ip bgp summary\nshow ip bgp neighbors\nshow route-map"
      },
      "sec-4": {
        "title": "Failover Validation",
        "lang": "IOS-XE",
        "code": "show track\nshow ip sla summary\nshow logging | include BFD|LINEPROTO"
      },
      "sec-5": {
        "title": "Hardening",
        "lang": "IOS-XE",
        "code": "show run | section line vty\nshow access-lists\nshow aaa servers"
      },
      "sec-6": {
        "title": "Monitoring",
        "lang": "IOS-XE",
        "code": "show flow monitor\nshow ip cef summary\nshow processes cpu sorted\nshow ip bgp summary\nshow ip bgp neighbors\nshow track\nshow ip sla summary\nshow ip route 0.0.0.0\nshow logging | include BFD|LINEPROTO"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "IOS-XE",
        "code": "show ip route\nshow ip ospf neighbor\nshow ip bgp summary"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "IOS-XE",
        "code": "show run | section router ospf\nshow run | section router bgp\nshow route-map"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "IOS-XE",
        "code": "ping 203.0.113.2 source loopback0\ntraceroute 203.0.113.2 source loopback0\nshow ip route 203.0.113.2"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "IOS-XE",
        "code": "show ip protocols\nshow ip bgp summary\nshow archive config differences nvram:startup-config system:running-config"
      }
    },
    "explanations": {
      "sec-1": "Tek router-at, baseline fillon me route table hygiene, interface health dhe protocol timers. Stabiliteti i control-plane eshte prioritet.",
      "sec-2": "Ne OSPF, ndarja ne area dhe LSA scope duhet te reduktoje churn. Kontrollo adjacency state dhe SPF frequency para ndryshimeve te medha.",
      "sec-3": "Per BGP, politika e import/export duhet te jete eksplicite me prefix-lists dhe route-maps. Evito default-accept ne kufij te ASN.",
      "sec-4": "Failover pattern me IP SLA/BFD duhet te testohet ne kushte reale. Dokumento ndikimin ne latency dhe packet loss gjate tranzicionit.",
      "sec-5": "Hardening ne router perfshin AAA, management plane ACL dhe logging te centralizuar. Cdo akses administrativ duhet te jete i gjurmueshem.",
      "sec-6": "Operacionet e router-ave kerkojne ndryshime me maintenance window, pre-check dhe post-check. Kjo shmang regresione ne rrjetin core.",
      "sec-7": "Lab-et e routing duhet te perfshijne route leak, timer mismatch dhe failover test. Ekipi duhet te mesoje te riktheje konvergjencen pa downtime te gjate.",
      "sec-8": "Quiz routing duhet te sfidoje zgjedhjen e protokollit dhe policy-se ne varsi te topologjise dhe kufizimeve te biznesit.",
      "sec-9": "Troubleshooting ne routing kerkon krahasim mes expected-path dhe actual-path. Puno me show route, neighbor states dhe traceroute me source te sakte.",
      "sec-10": "Provimi final per router-at duhet te vertetoje aftesine per dizajn resilient, operim te sigurt dhe diagnoze te shpejte nen presion."
    }
  },
  "cisco-switches.html": {
    "label": "Cisco Switches",
    "topology": "Core Switch Pair\n     |\nDistribution Pair\n     |\n+----+----+----+\n|Access|Access|Access|\n VLANs: Users / Voice / Servers / Mgmt",
    "examples": {
      "sec-1": {
        "title": "Switch Example - VLAN + Trunk + Port Security",
        "lang": "IOS-XE",
        "code": "vlan 20\n name USERS\n!\ninterface GigabitEthernet1/0/24\n description Uplink-to-Distribution\n switchport mode trunk\n switchport trunk allowed vlan 20,30,40\n spanning-tree guard root\n!\ninterface GigabitEthernet1/0/10\n description Endpoint-User01\n switchport mode access\n switchport access vlan 20\n spanning-tree portfast\n switchport port-security\n switchport port-security maximum 2\n switchport port-security violation restrict",
        "steps": [
          "Create VLAN explicitly before assigning access ports.",
          "Restrict trunk allowed VLAN list to only required segments.",
          "Enable root guard on uplinks to prevent unexpected STP root changes.",
          "Use portfast only on endpoint-facing access ports.",
          "Enable port-security to limit MAC abuse and reduce lateral risk."
        ]
      },
      "sec-2": {
        "title": "Switch Example - VLAN and Trunk Baseline",
        "lang": "IOS",
        "code": "vlan 10\n name USERS\nvlan 20\n name SERVERS\nvlan 30\n name VOICE\n\ninterface GigabitEthernet1/0/1\n switchport mode access\n switchport access vlan 10\n spanning-tree portfast\n\ninterface GigabitEthernet1/0/48\n switchport mode trunk\n switchport trunk native vlan 999\n switchport trunk allowed vlan 10,20,30\n spanning-tree guard root",
        "steps": [
          "Create VLANs with clear naming for operations.",
          "Use access mode for endpoint ports only.",
          "Restrict trunk allowed VLANs to required set.",
          "Set dedicated native VLAN for hygiene.",
          "Enable root guard on uplinks to protect STP topology."
        ]
      },
      "sec-3": {
        "title": "Switch Example - VXLAN EVPN Edge Mapping",
        "lang": "NX-OS",
        "code": "feature nv overlay\nfeature vn-segment-vlan-based\n\nvlan 110\n  vn-segment 10110\nvlan 120\n  vn-segment 10120\n\ninterface nve1\n  no shutdown\n  source-interface loopback1\n  member vni 10110\n    ingress-replication protocol bgp\n  member vni 10120\n    ingress-replication protocol bgp",
        "steps": [
          "Enable required VXLAN/NVE features first.",
          "Map each VLAN to deterministic VNI.",
          "Use loopback as stable NVE source interface.",
          "Advertise VNI membership via EVPN control plane.",
          "Validate MAC/IP reachability across leaf boundaries."
        ]
      },
      "sec-6": {
        "title": "Switch Advanced - EVPN Multihoming and Gateway Redundancy",
        "lang": "NX-OS",
        "code": "feature interface-vlan\nfeature hsrp\nfeature nv overlay\n\ninterface Vlan110\n ip address 10.110.0.2/24\n hsrp 110\n  ip 10.110.0.1\n  priority 120\n  preempt\n\nrouter bgp 65010\n address-family l2vpn evpn\n  advertise-pip",
        "steps": [
          "Configure redundant anycast/default gateway model for VLAN.",
          "Use HSRP/anycast strategy aligned with EVPN design.",
          "Enable EVPN advertisement of endpoint reachability.",
          "Fail one leaf/uplink and validate host continuity.",
          "Check MAC move behavior and convergence events."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "VLAN Baseline",
        "lang": "IOS-XE",
        "code": "show vlan brief\nshow interfaces status\nshow mac address-table count"
      },
      "sec-2": {
        "title": "Trunk Checks",
        "lang": "IOS-XE",
        "code": "show interfaces trunk\nshow interfaces switchport\nshow run interface gi1/0/48"
      },
      "sec-3": {
        "title": "STP Stability",
        "lang": "IOS-XE",
        "code": "show spanning-tree summary\nshow spanning-tree root\nshow spanning-tree inconsistentports"
      },
      "sec-4": {
        "title": "L2 Security",
        "lang": "IOS-XE",
        "code": "show ip dhcp snooping\nshow ip arp inspection\nshow port-security interface gi1/0/10"
      },
      "sec-5": {
        "title": "L3 Gateway",
        "lang": "IOS-XE",
        "code": "show ip interface brief | include Vlan\nshow standby brief\nshow ip route"
      },
      "sec-6": {
        "title": "Validation",
        "lang": "IOS-XE",
        "code": "show logging | last 50\nshow interfaces counters errors\nshow cdp neighbors detail\nshow vlan brief\nshow interfaces trunk\nshow spanning-tree root\nshow etherchannel summary\nshow ip interface brief\nshow l2vpn evpn summary"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "IOS-XE",
        "code": "show vlan brief\nshow interfaces trunk\nshow spanning-tree summary"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "IOS-XE",
        "code": "show ip dhcp snooping\nshow ip arp inspection\nshow port-security"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "IOS-XE",
        "code": "show spanning-tree vlan 20\nshow mac address-table vlan 20\nshow interfaces gi1/0/20 status"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "IOS-XE",
        "code": "show spanning-tree root\nshow standby brief\nshow archive config differences nvram:startup-config system:running-config"
      }
    },
    "explanations": {
      "sec-1": "Ne switching, nis me VLAN plan dhe consistency te trunk/access ports. Drift i konfigurimeve ne access layer krijon incidente te veshtira.",
      "sec-2": "Trunk-et duhet te kene allowed VLAN list minimale dhe native VLAN te kontrolluar. Kjo ul blast radius ne rast misconfiguration.",
      "sec-3": "STP stabiliteti kerkon root placement te planifikuar dhe mbrojtje si BPDU guard/root guard. Shmang loop-et me kontrolle preventive.",
      "sec-4": "L2 security duhet te kombinoje DHCP snooping, DAI dhe port security sipas tipit te endpoint-it. Balanco sigurine me operational overhead.",
      "sec-5": "Kur switch ben edhe gateway role, monitoro SVI health, FHRP state dhe ARP behavior. Problemet L2/L3 duhen ndare qarte ne diagnoze.",
      "sec-6": "Operacionet e switch-eve duhet te ndjekin change template te standardizuar: backup config, staged rollout dhe validation per secilin VLAN kritik.",
      "sec-7": "Lab-et e switching duhet te mbulojne STP loop scenario, trunk pruning error dhe endpoint security event. Cdo skenar mbyllet me root-cause te dokumentuar.",
      "sec-8": "Quiz switching duhet te testoje zgjedhje te sakta per STP guards, VLAN design dhe trade-off mes security dhe fleksibilitetit operativ.",
      "sec-9": "Ne troubleshooting, nis me status fizik, pastaj MAC learning dhe STP state. Mos kaloni ne hipoteza komplekse pa verifikuar bazat.",
      "sec-10": "Vleresimi final i switching duhet te provoje stabilitet L2/L3 dhe aftesi per te parandaluar outage nga gabime konfigurimi."
    }
  },
  "forti.html": {
    "label": "FortiGate",
    "topology": "Internet/MPLS\n    |\n[FortiGate HA]\n    |\n +-- VDOM-Prod\n +-- VDOM-Shared\n +-- SD-WAN Overlay Tunnels",
    "examples": {
      "sec-1": {
        "title": "FortiGate Example - Policy + SD-WAN Rule",
        "lang": "FortiOS CLI",
        "code": "config firewall policy\n edit 100\n  set name \"APP-TO-DMZ-HTTPS\"\n  set srcintf \"port2\"\n  set dstintf \"port3\"\n  set srcaddr \"NET_APP\"\n  set dstaddr \"NET_DMZ_WEB\"\n  set action accept\n  set schedule \"always\"\n  set service \"HTTPS\"\n  set logtraffic all\n next\nend\n\nconfig system sdwan\n config service\n  edit 10\n   set name \"SaaS-Priority\"\n   set dst \"all\"\n   set priority-members 1 2\n  next\n end\nend",
        "steps": [
          "Create firewall rule with explicit interfaces, addresses, and service scope.",
          "Enable full traffic logging for forensic and audit visibility.",
          "Define SD-WAN service entry for application path preference.",
          "Set priority-members to control failover behavior across WAN links.",
          "Validate with health-check and route-table output after deployment."
        ]
      },
      "sec-2": {
        "title": "FortiGate Example - Interzone Policy with Profiles",
        "lang": "FortiOS CLI",
        "code": "config firewall policy\n  edit 100\n    set name \"inside-to-dmz-https\"\n    set srcintf \"port2\"\n    set dstintf \"port3\"\n    set srcaddr \"NET_INSIDE\"\n    set dstaddr \"DMZ_WEB\"\n    set service \"HTTPS\"\n    set action accept\n    set schedule \"always\"\n    set logtraffic all\n    set ips-sensor \"default\"\n    set av-profile \"default\"\n  next\nend",
        "steps": [
          "Bind policy to explicit source and destination interfaces.",
          "Use address objects for maintainable scope control.",
          "Allow only required service instead of broad ALL.",
          "Attach IPS and AV profiles to allowed business flow.",
          "Enable full logging for incident traceability."
        ]
      },
      "sec-4": {
        "title": "FortiGate Example - SD-WAN Steering Rule",
        "lang": "FortiOS CLI",
        "code": "config system sdwan\n  config service\n    edit 1\n      set name \"saas-priority\"\n      set dst \"SaaS-Nets\"\n      set src \"all\"\n      set priority-members 1 2\n      set health-check \"internet-sla\"\n      set mode priority\n    next\n  end\nend",
        "steps": [
          "Define destination object for SaaS traffic class.",
          "Prioritize preferred WAN members by business requirement.",
          "Use health checks so path decisions follow real SLA.",
          "Keep failover member order deterministic.",
          "Monitor session migration during link degradation tests."
        ]
      },
      "sec-6": {
        "title": "FortiGate Advanced - Active-Passive HA and Session Pickup",
        "lang": "FortiOS CLI",
        "code": "config system ha\n  set mode a-p\n  set group-name \"FGT-PROD-HA\"\n  set hbdev \"port5\" 100\n  set session-pickup enable\n  set override disable\nend\n\nget system ha status\n\n# Failover drill:\nexecute ha failover set 1",
        "steps": [
          "Configure HA heartbeat interfaces and group identity.",
          "Enable session pickup for smoother failover user experience.",
          "Validate primary/secondary role and sync status.",
          "Trigger controlled failover and observe traffic continuity.",
          "Capture metrics and update runbook with lessons learned."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "VDOM Checks",
        "lang": "FortiOS",
        "code": "get system status\nget system vdom-property\nshow system interface"
      },
      "sec-2": {
        "title": "Policy Lifecycle",
        "lang": "FortiOS",
        "code": "show firewall policy\nshow firewall address\ndiagnose firewall iprope list"
      },
      "sec-3": {
        "title": "Security Profiles",
        "lang": "FortiOS",
        "code": "show antivirus profile\nshow ips sensor\nshow webfilter profile"
      },
      "sec-4": {
        "title": "SD-WAN and VPN",
        "lang": "FortiOS",
        "code": "diagnose sys sdwan health-check\nget router info routing-table all\ndiagnose vpn tunnel list"
      },
      "sec-5": {
        "title": "HA and Firmware",
        "lang": "FortiOS",
        "code": "get system ha status\nexecute backup config flash\nget system performance status"
      },
      "sec-6": {
        "title": "Logging",
        "lang": "FortiOS",
        "code": "execute log filter category 0\nexecute log display\ndiagnose debug crashlog read\nget system ha status\nget system performance status\nexecute ha failover set 1\nget router info routing-table all\ndiagnose sys session list"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "FortiOS",
        "code": "show firewall policy\ndiagnose sys sdwan health-check\ndiagnose vpn tunnel list"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "FortiOS",
        "code": "show system interface\nshow antivirus profile\nshow ips sensor"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "FortiOS",
        "code": "diagnose debug enable\ndiagnose debug application ike -1\ndiagnose debug disable"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "FortiOS",
        "code": "get system status\nget system ha status\nexecute backup config tftp <file> <server-ip>"
      }
    },
    "explanations": {
      "sec-1": "Ne FortiGate, arkitektura me VDOM kerkon ndarje te qarte te pergjegjesive dhe objekteve. Governance i policy-ve fillon me naming dhe standarde konsistente.",
      "sec-2": "Firewall policies ne FortiGate duhet te menaxhohen me renditje logjike dhe object reuse te kontrolluar. Policy cleanup periodik parandalon rrezikun e aksesit te panevojshem.",
      "sec-3": "Security profiles (IPS, AV, web filter) duhen tune sipas trafikut real. Fillimisht monitor mode, pastaj enforcement per te ulur false positives.",
      "sec-4": "Per SD-WAN/VPN, monitoro health-check metrics dhe path steering. Vendimet e rruges duhet te ndjekin SLA teknike dhe jo vetem prioritet statik.",
      "sec-5": "HA ne FortiGate kerkon test failover dhe verifikim session pickup. Vetem statusi green nuk mjafton pa prove funksionale.",
      "sec-6": "Operacionet FortiGate duhet te perfshijne policy revision process, backup para ndryshimit dhe compare pas deploy-it. Kjo mban kontroll te plote mbi drift-in.",
      "sec-7": "Lab-et FortiGate duhet te trajtojne SD-WAN path degradation, policy conflict dhe VPN instability. Fokus te jete ne diagnoze sistematike, jo trial-and-error.",
      "sec-8": "Quiz FortiGate duhet te mat kuptimin e VDOM boundaries, profile tuning dhe impaktit te policy order ne rrjedhen reale te trafikut.",
      "sec-9": "Kur diagnostikon, perdor debug me scope te kufizuar dhe kohe te shkurter. Mblidh evidenca pa rrezikuar performancen e pajisjes ne prodhim.",
      "sec-10": "Provimi final FortiGate duhet te tregoje qe kandidati menaxhon sigurine dhe disponueshmerine pa kompromis ne operim ditor."
    }
  },
  "palo-alto.html": {
    "label": "Palo Alto",
    "topology": "Internet\n  |\n[Palo Alto Cluster] <--> [Panorama]\n  |\nZones: Untrust / DMZ / Trust / Shared\n  |\nApps + User-ID + Threat Profiles",
    "examples": {
      "sec-1": {
        "title": "Palo Alto Example - Zone-Based Security Rule",
        "lang": "PAN-OS Policy",
        "code": "Rule Name: TRUST-TO-DMZ-HTTPS\nSource Zone: trust\nDestination Zone: dmz\nSource Address: NET_APP\nDestination Address: NET_DMZ_WEB\nApplication: ssl, web-browsing\nService: application-default\nUser: any\nAction: allow\nProfile Group: strict-threat-profiles\nLog at Session End: yes",
        "steps": [
          "Anchor the policy on source/destination zones before narrowing addresses.",
          "Use application-default service to avoid overly broad port exposure.",
          "Attach strict threat profile group so allowed traffic is still inspected.",
          "Enable session-end logging for accurate outcome visibility.",
          "Validate with policy match test and session browser after commit."
        ]
      },
      "sec-2": {
        "title": "Palo Alto Example - Zone-Based Security Policy",
        "lang": "PAN-OS XML API Style",
        "code": "<entry name=\"allow-inside-to-dmz-https\">\n  <from><member>trust</member></from>\n  <to><member>dmz</member></to>\n  <source><member>NET_INSIDE</member></source>\n  <destination><member>DMZ_WEB</member></destination>\n  <application><member>ssl</member></application>\n  <service><member>application-default</member></service>\n  <action>allow</action>\n  <log-start>yes</log-start>\n  <log-end>yes</log-end>\n</entry>",
        "steps": [
          "Scope rule by zone boundaries first.",
          "Reference address objects for maintainability.",
          "Use App-ID and application-default service model.",
          "Keep logs at start and end for forensic context.",
          "Place rule above broader generic policy entries."
        ]
      },
      "sec-3": {
        "title": "Palo Alto Example - Threat Profile Group Attachment",
        "lang": "PAN-OS",
        "code": "Security Policy: allow-inside-to-dmz-https\nProfile Setting Group: strict-enterprise\n  - Antivirus: default\n  - Anti-Spyware: strict\n  - Vulnerability Protection: strict\n  - URL Filtering: enterprise-web\n  - File Blocking: block-executables",
        "steps": [
          "Create reusable profile group for enterprise baseline.",
          "Attach group on allow rules that carry business traffic.",
          "Tune strictness in monitor mode before hard blocking.",
          "Track false positives and adjust by exception process.",
          "Review profile efficacy with threat logs regularly."
        ]
      },
      "sec-6": {
        "title": "Palo Alto Advanced - Commit Pipeline and HA Failover",
        "lang": "PAN-OS CLI/API",
        "code": "> show high-availability state\n> show jobs all\n\n# Commit and push from Panorama\n# commit-all shared-policy device-group DG-PROD\n\n# Controlled failover (maintenance)\n> request high-availability state suspend\n\n# Post checks\n> show session all filter application ssl",
        "steps": [
          "Ensure candidate config is validated before commit-all.",
          "Track job completion and policy distribution success.",
          "Suspend active node for controlled role transition.",
          "Validate key business app sessions after failover.",
          "Re-enable normal HA state after acceptance checks."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "Policy Model",
        "lang": "PAN-OS",
        "code": "show running security-policy\nshow rule-hit-count vsys vsys1 rule-base security rules all\nshow jobs all"
      },
      "sec-2": {
        "title": "Zone/User Controls",
        "lang": "PAN-OS",
        "code": "show zone-protection zone trust\nshow user ip-user-mapping all\nshow session all filter zone trust"
      },
      "sec-3": {
        "title": "Threat Profiles",
        "lang": "PAN-OS",
        "code": "show profiles anti-spyware\nshow profiles vulnerability\nshow log threat direction equal backward"
      },
      "sec-4": {
        "title": "Panorama Ops",
        "lang": "PAN-OS",
        "code": "show panorama-status\nshow config pushed-template\nshow config diff"
      },
      "sec-5": {
        "title": "Decryption Controls",
        "lang": "PAN-OS",
        "code": "show running decryption-policy\nshow session all filter ssl-decrypt yes\nshow counter global filter category eq ssl"
      },
      "sec-6": {
        "title": "Monitoring",
        "lang": "PAN-OS",
        "code": "show system resources\nshow session info\nshow logging-status\nshow high-availability state\nshow jobs all\nshow session all filter application ssl\nshow routing route\nrequest high-availability state suspend"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "PAN-OS",
        "code": "show running security-policy\nshow rule-hit-count vsys vsys1 rule-base security rules all\nshow profiles anti-spyware"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "PAN-OS",
        "code": "show user ip-user-mapping all\nshow zone-protection zone trust\nshow panorama-status"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "PAN-OS",
        "code": "test security-policy-match from trust to untrust source 10.1.1.10 destination 172.16.5.10 protocol 6 destination-port 443\nshow session id <id>"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "PAN-OS",
        "code": "show jobs all\nshow config diff\nshow system info"
      }
    },
    "explanations": {
      "sec-1": "Ne Palo Alto, modeli App-ID/User-ID duhet te drejtoje policy design. Rregullat e gjera me any-any krijojne risk dhe veshtiresojne auditin.",
      "sec-2": "Segmentimi me zona kerkon definim te qarte te trust boundaries. Cdo rrjedhe trafiku duhet te kete arsye biznesi dhe kontroll sigurie.",
      "sec-3": "Threat profiles duhen lidhur me sensitivity te aplikacioneve. Per profile agresive, testimi paraprak eshte kritik per te shmangur bllokime legjitime.",
      "sec-4": "Me Panorama, standardizimi i templates/device-groups ul drift-in operacional. Commit workflow duhet te kete kontroll para dhe pas deploy-it.",
      "sec-5": "Decryption policy kerkon balancim mes visibility dhe privacy/compliance. Dokumento exception-et dhe pronaret e tyre.",
      "sec-6": "Operacionet PAN-OS duhet te kene commit discipline, validate jobs dhe rollback checkpoints. Kjo ul riskun e outage pas ndryshimeve te policy-se.",
      "sec-7": "Lab-et Palo Alto duhet te mbulojne rule shadowing, false positive ne threat profile dhe issue ne decryption path. Cdo ushtrim duhet te kete rezultat te matshëm.",
      "sec-8": "Quiz Palo Alto duhet te vleresoje aftesine per te zgjedhur policy strategy sipas aplikacionit, perdoruesit dhe zone risk profile.",
      "sec-9": "Per troubleshooting ne PAN-OS, perdor policy-match test, session lookup dhe counters. Kjo jep izolim te shpejte mes policy, routing dhe TLS issues.",
      "sec-10": "Ne vleresimin final Palo Alto, kandidati duhet te tregoje se mund te balancoje security enforcement me business continuity."
    }
  },
  "f5-loadbalancers.html": {
    "label": "F5 Load Balancers",
    "topology": "Clients\n  |\n[VIP on F5]\n  |\n+-- Pool-A (app01, app02)\n+-- Pool-B (app03, app04)\n  |\nBack-end Services / DB",
    "examples": {
      "sec-1": {
        "title": "F5 Example - Virtual Server and Pool",
        "lang": "tmsh",
        "code": "tmsh create ltm pool pool_web_prod members add { 10.20.10.11:443 10.20.10.12:443 } monitor https\n\ntmsh create ltm virtual vs_web_prod destination 198.51.100.20:443 ip-protocol tcp pool pool_web_prod profiles add { tcp clientssl } source-address-translation { type automap }\n\ntmsh modify ltm virtual vs_web_prod persist replace-all-with { cookie }",
        "steps": [
          "Create pool first because the virtual server depends on it.",
          "Attach HTTPS monitor so unhealthy members are automatically removed.",
          "Build virtual server with client SSL profile for encrypted front-end traffic.",
          "Enable source translation and persistence for stable application sessions.",
          "Verify member state and live connections before go-live."
        ]
      },
      "sec-2": {
        "title": "F5 Example - Virtual Server with Cookie Persistence",
        "lang": "tmsh",
        "code": "create ltm pool pool_app_https members add { 10.20.10.21:443 10.20.10.22:443 } monitor https\ncreate ltm persistence cookie cookie_persist defaults-from cookie\ncreate ltm virtual vs_app_https {\n  destination 203.0.113.50:443\n  ip-protocol tcp\n  pool pool_app_https\n  profiles add { tcp clientssl http }\n  persist replace-all-with { cookie_persist }\n  source-address-translation { type automap }\n}",
        "steps": [
          "Create pool first with health monitor binding.",
          "Add cookie persistence for session-aware applications.",
          "Attach TCP/SSL/HTTP profiles to virtual server.",
          "Enable SNAT automap when return path requires translation.",
          "Validate member health and persistence records after deployment."
        ]
      },
      "sec-5": {
        "title": "F5 Example - WAF Policy in Blocking Mode",
        "lang": "tmsh",
        "code": "create asm policy asm_app_prod template POLICY_TEMPLATE_RAPID_DEPLOYMENT application-language utf-8\nmodify asm policy asm_app_prod enforcement-mode blocking\nmodify asm policy asm_app_prod server-technologies add { Apache Linux }\nmodify ltm virtual vs_app_https policies add { asm_app_prod }",
        "steps": [
          "Create WAF policy from baseline template.",
          "Switch to blocking mode only after staged validation.",
          "Declare server technologies for better signature tuning.",
          "Attach policy to target virtual server explicitly.",
          "Review violations dashboard and tune before broad rollout."
        ]
      },
      "sec-6": {
        "title": "F5 Advanced - Active/Standby Device Sync and Traffic Group Failover",
        "lang": "tmsh",
        "code": "run cm config-sync to-group dg-prod-sync\nshow cm sync-status\n\n# Force traffic group failover\nrun sys failover standby traffic-group traffic-group-1\n\n# Post checks\nshow ltm virtual vs_app_https\nshow ltm pool pool_app_https members",
        "steps": [
          "Sync candidate changes to peer before failover test.",
          "Confirm sync-status is green on both devices.",
          "Move traffic group to standby unit in maintenance window.",
          "Validate VIP availability and pool member health.",
          "Measure impact and confirm rollback path."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "Object Baseline",
        "lang": "tmsh",
        "code": "tmsh list ltm virtual\ntmsh list ltm pool\ntmsh list ltm monitor"
      },
      "sec-2": {
        "title": "Load Balancing",
        "lang": "tmsh",
        "code": "tmsh modify ltm pool pool_web load-balancing-mode least-connections-member\ntmsh list ltm persistence\ntmsh show ltm pool pool_web members"
      },
      "sec-3": {
        "title": "TLS Lifecycle",
        "lang": "tmsh",
        "code": "tmsh list ltm profile client-ssl\ntmsh list sys file ssl-cert\ntmsh show sys crypto check-cert"
      },
      "sec-4": {
        "title": "Health and Failover",
        "lang": "tmsh",
        "code": "tmsh show cm failover-status\ntmsh show ltm pool\ntmsh show ltm virtual"
      },
      "sec-5": {
        "title": "WAF Policy",
        "lang": "tmsh",
        "code": "tmsh list asm policy\ntmsh show asm policy\ntmsh show asm status"
      },
      "sec-6": {
        "title": "Runbook Ops",
        "lang": "tmsh",
        "code": "tmsh save sys config\ntmsh show sys connection\ntmsh show sys performance throughput\nshow cm sync-status\nshow cm traffic-group\nshow ltm virtual vs_app_https\nshow ltm pool pool_app_https members\nrun sys failover standby traffic-group traffic-group-1"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "tmsh",
        "code": "tmsh show ltm virtual\ntmsh show ltm pool\ntmsh show cm failover-status"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "tmsh",
        "code": "tmsh list ltm persistence\ntmsh list ltm profile client-ssl\ntmsh list asm policy"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "tmsh",
        "code": "tmsh show ltm pool pool_web members detail\ntmsh show ltm virtual vs_web\ntcpdump -nni 0.0:nnn host <client_or_server_ip>"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "tmsh",
        "code": "tmsh show sys performance throughput\ntmsh show ltm virtual\ntmsh save sys config"
      }
    },
    "explanations": {
      "sec-1": "Ne F5, modeli i objekteve (virtual server, pool, monitor, profile) duhet te jete i standardizuar. Kjo e ben troubleshooting me te shpejte dhe me pak gabime.",
      "sec-2": "Per load balancing, zgjidh algoritmin sipas natyres se aplikacionit dhe session behavior. Mos perdor defaults pa validuar ndikimin ne latency.",
      "sec-3": "Ne TLS lifecycle, menaxho certifikatat me inventar dhe afate skadimi te monitoruara. Rotacioni i certifikatave duhet te kete plan testimi para prodhim.",
      "sec-4": "Health monitors dhe failover duhet te testohen me skenare reale te degradimit. Monitor i gabuar mund te mbaje online nje backend jofunksional.",
      "sec-5": "Per WAF ne F5, politika duhet tune gradualisht nga learning ne blocking. Evidencat e false positives dokumentohen para ndryshimeve agresive.",
      "sec-6": "Operacionet F5 duhet te menaxhohen me release plan qe perfshin iRule review, monitor validation dhe post-change traffic verification.",
      "sec-7": "Lab-et F5 duhet te simulojne pool member failure, cert expiry incident dhe WAF false positive. Objektivi eshte reagim i shpejte me impakt minimal.",
      "sec-8": "Quiz F5 duhet te testoje vendime praktike mbi persistence, health monitor design dhe ndarjen e pergjegjesive mes app dhe network team.",
      "sec-9": "Kur ka incident ne F5, ndiq zinxhirin klient-VIP-pool-member. Kjo ndan shpejt nese problemi eshte network, L7 policy apo backend app.",
      "sec-10": "Provimi final F5 duhet te demonstroje qe kandidati mban disponueshmeri te larte edhe gjate ndryshimeve komplekse ne trafik."
    }
  },
  "vpn.html": {
    "label": "VPN",
    "topology": "Site-A FW -------- IPsec Tunnel -------- Site-B FW\n    |                                      |\n  LAN-A                                  LAN-B\n    |\nRemote Users -- SSL VPN Gateway -- Internal Apps",
    "examples": {
      "sec-1": {
        "title": "VPN Example - IKEv2 Site-to-Site Baseline",
        "lang": "Firewall CLI",
        "code": "crypto ikev2 policy 10\n encryption aes-256\n integrity sha256\n group 14\n prf sha256\n lifetime seconds 28800\n\ncrypto ipsec ikev2 ipsec-proposal S2S-PROPOSAL\n protocol esp encryption aes-256\n protocol esp integrity sha-256\n\ncrypto map OUTSIDE-MAP 10 match address VPN-ACL\ncrypto map OUTSIDE-MAP 10 set peer 203.0.113.10\ncrypto map OUTSIDE-MAP 10 set ikev2 ipsec-proposal S2S-PROPOSAL\ncrypto map OUTSIDE-MAP interface outside",
        "steps": [
          "Define IKEv2 policy with matching crypto parameters on both peers.",
          "Create IPsec proposal to control ESP encryption/integrity.",
          "Map interesting traffic ACL so only intended networks are tunneled.",
          "Bind peer and proposal in crypto map entry with explicit sequence.",
          "Apply crypto map to outside interface and validate SA establishment."
        ]
      },
      "sec-2": {
        "title": "VPN Example - IKEv2 and IPsec Policy Baseline",
        "lang": "Cisco IOS-XE",
        "code": "crypto ikev2 proposal IKEV2-PROP\n encryption aes-cbc-256\n integrity sha256\n group 14\n\ncrypto ikev2 policy IKEV2-POL\n proposal IKEV2-PROP\n\ncrypto ipsec transform-set TS-AES256-SHA esp-aes 256 esp-sha256-hmac\n mode tunnel\n\ncrypto map CMAP 10 ipsec-isakmp\n set peer 198.51.100.10\n set ikev2-profile IKEV2-PROFILE\n set transform-set TS-AES256-SHA\n match address ACL-VPN-TRAFFIC",
        "steps": [
          "Define deterministic IKEv2 crypto proposal first.",
          "Bind proposal into policy for negotiation consistency.",
          "Create strong IPsec transform set for phase2.",
          "Attach peer, profile, and ACL in crypto map.",
          "Mirror matching settings on remote peer to avoid mismatch."
        ]
      },
      "sec-3": {
        "title": "VPN Example - Route-Based Tunnel and Policy Routing",
        "lang": "IOS-XE",
        "code": "interface Tunnel10\n ip address 169.254.10.1 255.255.255.252\n tunnel source GigabitEthernet0/0\n tunnel destination 198.51.100.10\n tunnel mode ipsec ipv4\n tunnel protection ipsec profile IPSEC-PROFILE\n\nip route 172.16.50.0 255.255.255.0 Tunnel10\nip access-list extended ACL-VPN-BYPASS-NAT\n permit ip 10.10.10.0 0.0.0.255 172.16.50.0 0.0.0.255",
        "steps": [
          "Build route-based tunnel interface for cleaner operations.",
          "Install remote prefix route through tunnel interface.",
          "Create NAT exemption ACL for interesting traffic.",
          "Keep tunnel and route objects aligned with crypto domains.",
          "Test both control plane and application plane connectivity."
        ]
      },
      "sec-6": {
        "title": "VPN Advanced - Dual Tunnel Redundancy with SLA Tracking",
        "lang": "IOS-XE",
        "code": "crypto map CMAP 10 ipsec-isakmp\n set peer 198.51.100.10\n set transform-set TS-AES256-SHA\n match address ACL-VPN-PRIMARY\n\ncrypto map CMAP 20 ipsec-isakmp\n set peer 203.0.113.10\n set transform-set TS-AES256-SHA\n match address ACL-VPN-BACKUP\n\nip sla 20\n icmp-echo 172.16.50.1 source-interface Tunnel10\n frequency 5\ntrack 20 ip sla 20 reachability",
        "steps": [
          "Build primary and backup peers with separate match ACLs.",
          "Track remote endpoint reachability with SLA.",
          "Tune route preference for deterministic primary path.",
          "Force primary outage and confirm backup tunnel activation.",
          "Verify application recovery and return-to-primary behavior."
        ]
      },
      "sec-11": {
        "title": "FortiGate - Phase 1 and Phase 2",
        "lang": "FortiGate CLI",
        "code": "config vpn ipsec phase1-interface\n  edit \"S2S-HQ\"\n    set interface \"wan1\"\n    set ike-version 2\n    set remote-gw 203.0.113.10\n    set proposal aes256-sha256\n    set psksecret <shared-secret>\n  next\nend\n\nconfig vpn ipsec phase2-interface\n  edit \"S2S-HQ-P2\"\n    set phase1name \"S2S-HQ\"\n    set proposal aes256-sha256\n    set src-subnet 10.10.10.0 255.255.255.0\n    set dst-subnet 172.16.50.0 255.255.255.0\n    set keylifeseconds 3600\n  next\nend",
        "steps": [
          "Use phase 1 to define the IKEv2 peer, interface, and crypto proposal.",
          "Use phase 2 to bind the interesting traffic selectors and ESP proposal.",
          "Keep the PSK, proposals, and lifetimes aligned on both peers.",
          "Validate that the source and destination subnets match the intended encryption domain.",
          "Confirm the tunnel comes up cleanly before routing application traffic through it."
        ]
      },
      "sec-12": {
        "title": "Palo Alto - Phase 1 and Phase 2",
        "lang": "PAN-OS CLI",
        "code": "set network ike crypto-profiles ike-crypto-profiles IKEV2-PROFILE authentication sha256 encryption aes-256-cbc dh-group group14 lifetime hour 8\nset network ike gateway GW-HQ authentication pre-shared-key key <shared-secret>\nset network ike gateway GW-HQ local-address interface ethernet1/1 ip 198.51.100.20\nset network ike gateway GW-HQ peer-address ip 203.0.113.10\nset network ike gateway GW-HQ protocol ikev2 ike-crypto-profile IKEV2-PROFILE\n\nset network ipsec crypto-profiles ipsec-crypto-profiles IPSEC-PROFILE esp authentication sha256 encryption aes-256-cbc lifetime hour 1\nset network tunnel ipsec-tunnel TUN-HQ auto-key ike-gateway GW-HQ ipsec-crypto-profile IPSEC-PROFILE\nset network tunnel tunnel-interface tunnel.10\nset network tunnel ipsec-tunnel TUN-HQ tunnel-interface tunnel.10",
        "steps": [
          "Phase 1 is the IKE gateway plus IKE crypto profile that negotiates the secure channel.",
          "Phase 2 is the IPsec crypto profile that defines ESP protection for data traffic.",
          "Tie the tunnel interface to the IPsec tunnel so routing stays simple and route-based.",
          "Match lifetimes and transforms with the remote peer to avoid negotiation failures.",
          "Use proxy-ID or traffic selector design consistently when the peer requires it."
        ]
      },
      "sec-13": {
        "title": "Cisco - Phase 1 and Phase 2",
        "lang": "Cisco IOS-XE",
        "code": "crypto ikev2 proposal IKEV2-PROP\n encryption aes-cbc-256\n integrity sha256\n group 14\n\ncrypto ikev2 policy IKEV2-POL\n proposal IKEV2-PROP\n\ncrypto ikev2 keyring KR-HQ\n peer HQ-PEER\n  address 203.0.113.10\n  pre-shared-key <shared-secret>\n\ncrypto ikev2 profile IKEV2-PROFILE\n match identity remote address 203.0.113.10 255.255.255.255\n authentication local pre-share\n authentication remote pre-share\n keyring local KR-HQ\n\ncrypto ipsec transform-set TS-AES256-SHA esp-aes 256 esp-sha256-hmac\n mode tunnel\n\ncrypto ipsec profile IPSEC-PROFILE\n set transform-set TS-AES256-SHA\n set ikev2-profile IKEV2-PROFILE",
        "steps": [
          "Phase 1 starts with the IKEv2 proposal, policy, keyring, and profile.",
          "Phase 2 uses the IPsec transform set and profile to protect data packets.",
          "Keep peer identity and PSK values aligned with the remote device.",
          "Use route-based tunnel interfaces or crypto maps consistently with the design.",
          "Verify both SA negotiation and route reachability after applying the config."
        ]
      },
      "sec-14": {
        "title": "Azure - Phase 1 and Phase 2",
        "lang": "Azure PowerShell",
        "code": "$policy = New-AzIpsecPolicy `\n  -IkeEncryption AES256 `\n  -IkeIntegrity SHA256 `\n  -DhGroup DHGroup14 `\n  -IpsecEncryption AES256 `\n  -IpsecIntegrity SHA256 `\n  -PfsGroup PFS14 `\n  -SALifeTimeSeconds 28800 `\n  -SADataSizeKilobytes 102400000\n\nNew-AzVirtualNetworkGatewayConnection `\n  -Name 'conn-hq' `\n  -VirtualNetworkGateway1 $vng `\n  -LocalNetworkGateway2 $lng `\n  -ConnectionType IPsec `\n  -RoutingWeight 10 `\n  -SharedKey <shared-secret> `\n  -IpsecPolicies $policy",
        "steps": [
          "Use the IPsec policy object to define IKE and IPsec parameters together.",
          "Treat IKE encryption, integrity, and DH group as the phase 1 baseline.",
          "Treat IPsec encryption, integrity, and PFS group as the phase 2 baseline.",
          "Attach the policy to the connection so the gateway negotiates the intended settings.",
          "Keep the values consistent with the on-prem peer and revalidate after changes."
        ]
      },
      "sec-15": {
        "title": "AWS - Phase 1 and Phase 2",
        "lang": "Terraform",
        "code": "resource \"aws_vpn_connection\" \"hq\" {\n  customer_gateway_id = aws_customer_gateway.hq.id\n  transit_gateway_id   = aws_ec2_transit_gateway.core.id\n  type                 = \"ipsec.1\"\n\n  tunnel1_ike_versions                  = [\"ikev2\"]\n  tunnel1_phase1_encryption_algorithms  = [\"AES256\"]\n  tunnel1_phase1_integrity_algorithms    = [\"SHA2-256\"]\n  tunnel1_phase1_dh_group_numbers        = [14]\n  tunnel1_phase1_lifetime_seconds        = 28800\n  tunnel1_phase2_encryption_algorithms   = [\"AES256\"]\n  tunnel1_phase2_integrity_algorithms    = [\"SHA2-256\"]\n  tunnel1_phase2_dh_group_numbers        = [14]\n  tunnel1_phase2_lifetime_seconds        = 3600\n}",
        "steps": [
          "Phase 1 is modeled with IKE version, encryption, integrity, DH group, and lifetime.",
          "Phase 2 is modeled with ESP encryption, integrity, DH group, and lifetime.",
          "Use Terraform so the tunnel parameters stay versioned and repeatable.",
          "Keep the customer gateway and transit gateway design aligned with routing needs.",
          "Validate the generated tunnel options against the peer device before rollout."
        ]
      },
      "sec-16": {
        "title": "GCP - Phase 1 and Phase 2",
        "lang": "gcloud",
        "code": "gcloud compute vpn-gateways create ha-vpn-gw --region=us-central1\n\ngcloud compute vpn-tunnels create vpn-hq-tunnel-a \\\n  --region=us-central1 \\\n  --ike-version=2 \\\n  --shared-secret=<shared-secret> \\\n  --peer-address=203.0.113.10 \\\n  --local-traffic-selector=10.10.10.0/24 \\\n  --remote-traffic-selector=172.16.50.0/24\n\n# Phase 1: IKEv2 negotiation and authentication\n# Phase 2: traffic selectors and IPsec SA protection",
        "steps": [
          "Create the HA VPN gateway first, then attach the tunnel to it.",
          "Use IKEv2 for phase 1 negotiation and shared secret authentication.",
          "Define local and remote traffic selectors to map phase 2 traffic flow.",
          "Keep the selectors consistent with the remote peer's encryption domain.",
          "Confirm routes and tunnel status after provisioning the connection."
        ]
      }
    },
    "commands": {
      "sec-1": {
        "title": "Tunnel Design",
        "lang": "CLI",
        "code": "show run crypto map\nshow run tunnel-group\nshow access-list"
      },
      "sec-2": {
        "title": "Crypto Baseline",
        "lang": "CLI",
        "code": "show crypto ikev2 policy\nshow crypto ipsec transform-set\nshow crypto ikev2 sa detail"
      },
      "sec-3": {
        "title": "Routing Control",
        "lang": "CLI",
        "code": "show route\nshow crypto ipsec sa | include local ident|remote ident\nshow nat detail"
      },
      "sec-4": {
        "title": "HA Patterns",
        "lang": "CLI",
        "code": "show failover\nshow interface ip brief\nshow sla monitor operational-state"
      },
      "sec-5": {
        "title": "Monitoring",
        "lang": "CLI",
        "code": "show vpn-sessiondb summary\nshow crypto ikev2 stats\nshow logging | include IKE|IPSEC"
      },
      "sec-6": {
        "title": "Incident Workflow",
        "lang": "CLI",
        "code": "clear crypto ikev2 sa\nclear crypto ipsec sa\npacket-tracer input inside tcp 10.1.10.10 50000 10.2.20.20 443\nshow crypto ikev2 sa\nshow crypto ipsec sa\nshow interface tunnel10\nshow ip route 172.16.50.0\nshow track\nshow logging | include IKE|IPSEC"
      },
      "sec-7": {
        "title": "Lab Validation",
        "lang": "CLI",
        "code": "show run crypto map\nshow crypto ikev2 sa\nshow crypto ipsec sa"
      },
      "sec-8": {
        "title": "Quiz Checks",
        "lang": "CLI",
        "code": "show crypto ikev2 policy\nshow crypto ipsec transform-set\nshow route"
      },
      "sec-9": {
        "title": "Troubleshooting",
        "lang": "CLI",
        "code": "show crypto ikev2 sa\nshow crypto ipsec sa\nshow asp drop"
      },
      "sec-10": {
        "title": "Exam Readiness",
        "lang": "CLI",
        "code": "show vpn-sessiondb summary\nshow failover\nshow running-config | include crypto|tunnel-group"
      }
    },
    "explanations": {
      "sec-1": "Ne VPN design, percakto domain-et e enkriptimit dhe kufijte e rrugeve qe lejohen. Qartesia ne scope parandalon overlap dhe asimetri.",
      "sec-2": "Crypto baseline duhet te harmonizoje algoritmet dhe lifetimes ne te dy anet. Mismatch-et ne phase1/phase2 jane shkaku me i shpeshte i deshtimit.",
      "sec-3": "Routing dhe NAT exemption ne VPN duhet te jene te sinkronizuara me encryption domains. Pa kete, tunelet ngrihen por trafiku nuk kalon sakte.",
      "sec-4": "Per HA te tuneleve, testimi duhet te perfshije failback dhe stabilizim pas rikthimit. Fokus te mos kete flapping ne links.",
      "sec-5": "Monitorimi i VPN duhet te mbuloje uptime, renegotiation failures dhe throughput trends. Kjo ndihmon te kapen problemet para se te kthehen ne incidente.",
      "sec-6": "Operacionet VPN duhet te perfshijne runbook per rekey events, cert rotation dhe emergency tunnel failover. Cdo veprim duhet te kete plan rikthimi.",
      "sec-7": "Lab-et VPN duhet te trajtojne selector mismatch, NAT conflict dhe unstable tunnel negotiation. Praktika duhet te ndjeke nje rend metodik kontrollesh.",
      "sec-8": "Quiz VPN duhet te testoje kuptimin e marredhenies mes crypto settings, routing policy dhe performances se aplikacionit.",
      "sec-9": "Troubleshooting ne VPN ndjek renditjen: SA state, selectors, NAT, routes, pastaj aplikacioni. Evidencat duhet te ruhen per analizat pas incidentit.",
      "sec-10": "Vleresimi final VPN duhet te provoje qe kandidati mund te siguroje lidhje te qendrueshme, te sigurta dhe te auditueshme ne production.",
      "sec-11": "FortiGate phase 1 dhe phase 2 duhen mbajtur te ndara qarte: phase 1 per IKE negotiation, phase 2 per selectors dhe trafikun qe do te kodohet.",
      "sec-12": "Palo Alto perdor IKE gateway per phase 1 dhe IPsec tunnel per phase 2. Kjo ndarje e ben dizajnin me te paster per operim dhe auditim.",
      "sec-13": "Ne Cisco, phase 1 perfshin IKEv2 proposal, policy dhe profile, ndersa phase 2 mban transform-set dhe IPsec profile per trafikun e tunelit.",
      "sec-14": "Ne Azure, IPsec policy e bashkon phase 1 dhe phase 2 ne nje objekt te vetem, qe e ben konfigurimin te standardizuar dhe te lehte per automatizim.",
      "sec-15": "Ne AWS, tunnel options te VPN connection ruajne parametrat e phase 1 dhe phase 2 ne menyre te qarte dhe te versionueshme ne IaC.",
      "sec-16": "Ne GCP, Cloud VPN shpreh phase 1 me IKEv2 dhe phase 2 me traffic selectors. Kjo qasje eshte e pershtatshme per route-based designs."
    }
  }
};
