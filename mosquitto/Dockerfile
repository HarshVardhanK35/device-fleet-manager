FROM eclipse-mosquitto:2

USER root
RUN addgroup -g 1000 render-secrets \
    && addgroup mosquitto render-secrets

COPY mosquitto.conf /mosquitto/config/mosquitto.conf

EXPOSE 1883 10000