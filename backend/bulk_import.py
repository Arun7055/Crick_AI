import csv
from app.core.database import SessionLocal
from app.models.core import Player

def import_roster_from_csv(file_path: str):
    db = SessionLocal()
    
    # Fetch existing player names so we don't create duplicates
    existing_players = {p.name for p in db.query(Player.name).all()}
    
    new_players = []
    
    try:
        with open(file_path, mode='r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                name = row['name'].strip()
                role = row['role'].strip()
                
                # Only add them if they aren't already in the Neon DB
                if name not in existing_players:
                    new_players.append(Player(name=name, role=role))
                    existing_players.add(name) # Prevent duplicates within the CSV itself

        if new_players:
            db.bulk_save_objects(new_players)
            db.commit()
            print(f"✅ Successfully imported {len(new_players)} new players into the database.")
        else:
            print("⚠️ No new players found. Everyone in the CSV is already in the database.")
            
    except FileNotFoundError:
        print(f"❌ Could not find the file: {file_path}")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_roster_from_csv("listt.csv")