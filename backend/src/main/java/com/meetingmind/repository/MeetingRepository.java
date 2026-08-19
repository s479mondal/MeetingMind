package com.meetingmind.repository;

import com.meetingmind.model.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface MeetingRepository extends MongoRepository<Meeting, String> {
    
    // Find meetings containing keyword in title or transcript
    @Query("{ '$or': [ { 'title': { '$regex': ?0, '$options': 'i' } }, { 'transcript': { '$regex': ?0, '$options': 'i' } } ] }")
    Page<Meeting> searchMeetings(String keyword, Pageable pageable);
}
