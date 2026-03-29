# Bot

A bot for testing the game server. The bot can be controlled from the terminal, or through an API for automation. The automation API mirrors the terminal commands as much as possible to keep tests true to the user experience and to make prototyping scenarios more convenient.

The automation API has an opinionated flow, it doesn't expect the API consumer to imperatively drive the bot.

# Logging

Logging is enabled/disabled by a with a hardcoded boolean variable.
When enabled, debugging information is printed into the terminal directly.
When using the automation API, the consumer subscribes to logging events.
Calls to the automation API must be logged.
