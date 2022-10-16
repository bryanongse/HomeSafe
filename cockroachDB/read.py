import os
import psycopg2

def recieveAll():
    returnLs = []
    conn = psycopg2.connect(os.environ["DATABASE_URL"])

    with conn.cursor() as cur:
        cur.execute("SELECT block_location, balance FROM berkeley")
        rows = cur.fetchall()
        conn.commit()
        print(f"Balances at {time.asctime()}:")
        for row in rows:
            ls.append(row)

    return ls

if __name__ == "__main__":
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM berkeley")
        rows = cur.fetchall()
        conn.commit()
        for row in rows:
            print(row)
