dockerup:
	docker-compose up

dockerup-prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

dockerdown: 
	docker-compose down
