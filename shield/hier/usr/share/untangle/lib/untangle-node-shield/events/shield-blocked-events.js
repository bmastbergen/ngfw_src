{
    "category": "Shield",
    "conditions": [
        {
            "column": "policy_id",
            "javaClass": "com.untangle.node.reporting.SqlCondition",
            "operator": "=",
            "value": ":policyId"
        },
        {
            "column": "shield_blocked",
            "javaClass": "com.untangle.node.reporting.SqlCondition",
            "operator": "is",
            "value": "TRUE"
        },
    ],
    "defaultColumns": ["time_stamp","username","hostname","c_client_port","s_server_addr","s_server_port","shield_blocked"],
    "displayOrder": 11,
    "javaClass": "com.untangle.node.reporting.EventEntry",
    "table": "sessions",
    "title": "Blocked Sessions",
    "uniqueId": "shield-1N0Xpss80O"
}