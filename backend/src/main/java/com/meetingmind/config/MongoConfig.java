package com.meetingmind.config;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class MongoConfig implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        MongoDatabase db = mongoTemplate.getDb();
        Set<String> existing = mongoTemplate.getCollectionNames();
        log.info("Connected to MongoDB Atlas database: {}", db.getName());

        // Create 'meetings' collection + indexes
        if (!existing.contains("meetings")) {
            mongoTemplate.createCollection("meetings");
            log.info("Created collection: meetings");
        } else {
            log.info("Collection already exists: meetings");
        }

        // Create 'system_settings' collection
        if (!existing.contains("system_settings")) {
            mongoTemplate.createCollection("system_settings");
            log.info("Created collection: system_settings");
        } else {
            log.info("Collection already exists: system_settings");
        }

        // Clean up deprecated settings so they refresh from .env
        try {
            org.bson.Document query = new org.bson.Document("llmModel", new org.bson.Document("$in", java.util.Arrays.asList("llama-3.1-8b-instant", "llama-3.3-70b-versatile", "llama3-8b-8192")));
            long deletedCount = db.getCollection("system_settings").deleteMany(query).getDeletedCount();
            if (deletedCount > 0) {
                log.info("Cleared deprecated system settings with deprecated models to force refresh from .env");
            }
        } catch (Exception e) {
            log.warn("Cleanup of deprecated settings skipped: {}", e.getMessage());
        }

        // Ensure index on meetings.title for search performance
        try {
            db.getCollection("meetings")
              .createIndex(Indexes.ascending("title"),
                           new IndexOptions().name("title_asc"));
            // Index for sorting by createdAt descending
            db.getCollection("meetings")
              .createIndex(Indexes.descending("createdAt"),
                           new IndexOptions().name("createdAt_desc"));
            log.info("Indexes ensured on meetings collection.");
        } catch (Exception e) {
            log.warn("Index creation skipped (may already exist): {}", e.getMessage());
        }

        log.info("MongoDB Atlas initialization complete. Collections: {}", mongoTemplate.getCollectionNames());
    }
}
