FROM eclipse-mosquitto:2

USER root

COPY mosquitto.conf /mosquitto/config/mosquitto.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 1883 10000

ENTRYPOINT ["/docker-entrypoint.sh"]