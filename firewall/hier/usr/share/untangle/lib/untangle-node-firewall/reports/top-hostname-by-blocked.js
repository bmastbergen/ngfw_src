{
    "uniqueId": "firewall-x4d7u259zk",
    "category": "Firewall",
    "description": "The number of flagged session grouped by hostname.",
    "displayOrder": 402,
    "enabled": true,
    "javaClass": "com.untangle.node.reporting.ReportEntry",
    "orderByColumn": "value",
    "orderDesc": true,
    "units": "hits",
    "pieGroupColumn": "hostname",
    "pieSumColumn": "count(*)",
    "conditions": [
        {
            "javaClass": "com.untangle.node.reporting.SqlCondition",
            "column": "firewall_blocked",
            "operator": "=",
            "value": "true"
        }
    ],
    "readOnly": true,
    "table": "sessions",
    "title": "Top Blocked Hostnames",
    "type": "PIE_GRAPH"
}