### Setting up RIOT `native`
When running this example under native, we must configure some global addresses,
as the RSMB doesn't seems to be able to handle link-local addresses. So for a
single RIOT native instance, we can do the following:

1. Setup `tap` and `tapbr` devices using RIOT's `tapsetup` script:
```
./tapsetup -c 2
```

2. Assign a site-global prefix to the `tapbr0` interface (the name could be
   different on OSX etc):
```
sudo ip a a fec0:affe::1/64 dev tapbr0
```

3. In the makefile, you have to change RIOTBASE into your directory containing RIOT, and then run the program:
```
make all term
```

4. Assign a site-global address with the same prefix to the RIOT `native`
   instance:
```
ifconfig 5 add fec0:affe::99
```


## Usage
This example maps all available MQTT-SN functions to shell commands. Simply type
`help` to see the available commands. The most important steps are explained
below:

- To connect to a broker, use the `con` command:
```
con fec0:affe::1 1885
```

-To start sending messages to Azure IoT Hub use 'pub':
```
pub
```

That's it, happy publishing!
