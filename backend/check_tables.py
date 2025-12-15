import sqlite3

# 连接到SQLite数据库
conn = sqlite3.connect('app.db')
cursor = conn.cursor()

# 查询所有表
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("数据库中的表：")
for table in tables:
    print(f"- {table[0]}")

# 关闭连接
conn.close()
