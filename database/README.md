Setup Baza de Date

2. In Terminalul din acel folder introduci comanda:
   docker-compose up -d

3.Pentru a intra in baza de date ruleaza comanda:
  docker exec -it assethub-db psql -U postgres -d assethub_db
