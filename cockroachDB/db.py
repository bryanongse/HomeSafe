import os
import psycopg2

conn = psycopg2.connect(os.environ["DATABASE_URL"])

with conn.cursor() as cur:

    cur.execute("CREATE TABLE berkeley (CASENO INT PRIMARY KEY, OFFENSE STRING, EVENTDT STRING, EVENTTM STRING, CVLEGEND STRING, CVDOW INT, InDbDate STRING, Block_Location STRING, City STRING, State STRING)")

    with open(r"C:\Users\bryan\Downloads\Berkeley_PD_-_Calls_for_Service.csv", "r") as f:
        lines = f.readlines()

        i=3
        while True:
            line = lines[i] + lines[i+1] + lines[i+2]
            i+=3
            parts = line.strip().split(',')

            try:
                cur.execute(
                    "INSERT INTO berkeley VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[-2], parts[-1]))
                conn.commit()
            except Exception as e:
                print(e)