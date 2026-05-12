Setup Baza de Date

1. Creaza fisierul docker-compose.yml intr un folder unde vrei ca baza de date sa fie localizata
   Codul care trebuie sa fie in fisier:
   version: '3.8'

services:
  postgres_db:
    image: postgres:16 # Folosim versiunea 16 (foarte stabilă)
    container_name: baza_mea_postgres
    restart: always
    environment:
      POSTGRES_USER: admin_user           # Numele de utilizator
      POSTGRES_PASSWORD: parola_super_secreta # Parola (schimb-o dacă vrei)
      POSTGRES_DB: aplicatia_mea          # Numele bazei de date inițiale
    ports:
      - "5432:5432" # Mapăm portul local 5432 la cel din container
    volumes:
      - pg_data:/var/lib/postgresql/data # Salvăm datele ca să nu se piardă la restart

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin_ui
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com # Email pentru logare în pgAdmin
      PGADMIN_DEFAULT_PASSWORD: admin        # Parola pentru pgAdmin
    ports:
      - "5050:80" # Mapăm portul 5050 din browser
    depends_on:
      - postgres_db

volumes:
  pg_data: # Declarăm volumul unde se vor salva fizic datele din baza de date

2. In Terminalul din acel folder introduci comanda:
   docker-compose up -d

3.Pentru a intra in baza de date ruleaza comanda:
  docker exec -it baza_mea_postgres psql -U admin_user -d aplicatia_mea
