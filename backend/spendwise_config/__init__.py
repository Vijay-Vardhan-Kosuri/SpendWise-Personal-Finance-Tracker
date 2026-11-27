"""Initialize PyMySQL as MySQLdb driver for Django MySQL backend."""
import pymysql

pymysql.install_as_MySQLdb()
# Ensure Django accepts PyMySQL version if needed
pymysql.version_info = (2, 2, 7, "final", 0)
