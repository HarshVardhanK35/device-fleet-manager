FROM eclipse-mosquitto:2

USER root
RUN apk add --no-cache shadow \
    && usermod -a -G 1000 mosquitto

COPY mosquitto.conf /mosquitto/config/mosquitto.conf

EXPOSE 1883 10000