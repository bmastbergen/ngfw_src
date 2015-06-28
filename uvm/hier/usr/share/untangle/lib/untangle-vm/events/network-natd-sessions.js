{
    "category": "Network",
    "conditions": [
        {
            "javaClass": "com.untangle.node.reporting.SqlCondition",
            "autoFormatValue": "false",
            "column": "c_client_addr",
            "operator": "!=",
            "value": "s_client_addr"
        }
    ],
    "defaultColumns": ["time_stamp","username","hostname","c_client_addr","s_client_addr","c_client_port","s_client_port","s_server_addr","s_server_port"],
    "displayOrder": 14,
    "javaClass": "com.untangle.node.reporting.EventEntry",
    "table": "sessions",
    "title": "All NATd Sessions",
    "uniqueId": "network-hNUcmhuNsV"
}