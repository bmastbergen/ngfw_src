{
    "uniqueId": "phish-blocker-1IWlRoV9",
    "category": "Phish Blocker",
    "description": "The number of email addresses with phish.",
    "displayOrder": 200,
    "enabled": true,
    "javaClass": "com.untangle.node.reporting.ReportEntry",
    "orderByColumn": "value",
    "orderDesc": true,
    "units": "msg",
    "pieGroupColumn": "addr",
    "pieSumColumn": "count(*)",
    "conditions": [
        {
            "column": "phish_blocker_is_spam",
            "javaClass": "com.untangle.node.reporting.SqlCondition",
            "operator": "=",
            "value": "true"
        }
    ],
    "readOnly": true,
    "table": "mail_addrs",
    "title": "Top Phish Recipients",
    "type": "PIE_GRAPH"
}