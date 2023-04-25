## Toll Config

Toll can be configed by changing the values in tollConfig.json.

### TOLL_FEE_INTERVAL_START_BY_MINUTE

[number, number][]
[toll fee interval start minute, toll fee][]

Time period for which a certain toll fee begins. Minutes since 00:00.

00:00: 0    ->  0
06:00: 360  ->  8
06:30: 390  ->  13
07:00: 420  ->  18
08:00: 480  ->  13
08:30: 510  ->  8
15:00: 900  ->  13
15:30: 930  ->  18
17:00: 1020 ->  13
18:00: 1080 ->  8
18:30: 1110 ->  0

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

### TOLL_PERIOD_LENGTH

number
minutes

Length of the period where you only can be billed once. 

### DAILY_TOLL_FEE_LIMIT

number

Maximum daily toll fee a vehicle can get billed for one day.
