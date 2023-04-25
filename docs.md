## Toll Config

Toll can be configed by changing the values in tollConfig.json.

### TOLL_FEE_INTERVAL_START_BY_MINUTE

[number, number][]
[toll fee interval start minute, toll fee][]

Time period for which a certain toll fee begins. Minutes since 00:00.

### TOLL_FREE_VEHICLE_TYPES

string[]

Vehicle types which are exempt from toll fees.

### TOLL_FREE_DATES

string[]
["month/day", "2/14", ...], 1-indexed

Dates that are toll free for everyone.

### TOLL_FREE_WEEKDAYS

number[]
0-6, sunday-saturday

Weekdays that are toll free for everyone.

