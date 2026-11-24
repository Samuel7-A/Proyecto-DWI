FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml ./
COPY src ./src
RUN mvn -B -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /src/target/cineverse-backend-0.0.1-SNAPSHOT.jar /app/app.jar
ENV SPRING_PROFILES_ACTIVE=supabase,cloud
ENV TZ=America/Lima
EXPOSE 10000
USER 10001:10001
ENTRYPOINT ["java","-Duser.timezone=America/Lima","-Xms64m","-Xmx224m","-XX:+UseSerialGC","-XX:MaxMetaspaceSize=160m","-XX:ReservedCodeCacheSize=32m","-Xss512k","-jar","/app/app.jar"]
