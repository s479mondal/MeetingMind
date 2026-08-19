package com.meetingmind.controller;

import com.meetingmind.model.ActionItem;
import com.meetingmind.model.Meeting;
import com.meetingmind.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/action-items")
public class ActionItemController {

    @Autowired
    private MeetingService meetingService;

    @PatchMapping("/{meetingId}/{actionItemId}")
    public ResponseEntity<?> updateActionItem(
            @PathVariable("meetingId") String meetingId,
            @PathVariable("actionItemId") String actionItemId,
            @RequestBody Map<String, Object> updates) {
        
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(meetingId);
        if (meetingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Meeting meeting = meetingOpt.get();
        Optional<ActionItem> itemOpt = meeting.getActionItems().stream()
                .filter(item -> item.getId().equals(actionItemId))
                .findFirst();

        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ActionItem item = itemOpt.get();

        // Update fields if provided
        if (updates.containsKey("status")) {
            item.setStatus(ActionItem.Status.valueOf(updates.get("status").toString().toUpperCase()));
        }
        if (updates.containsKey("assignee")) {
            item.setAssignee((String) updates.get("assignee"));
        }
        if (updates.containsKey("task")) {
            item.setTask((String) updates.get("task"));
        }
        if (updates.containsKey("priority")) {
            item.setPriority(ActionItem.Priority.valueOf(updates.get("priority").toString().toUpperCase()));
        }
        if (updates.containsKey("deadline")) {
            item.setDeadline((String) updates.get("deadline"));
        }

        meetingService.saveMeeting(meeting);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{meetingId}/{actionItemId}")
    public ResponseEntity<?> deleteActionItem(
            @PathVariable("meetingId") String meetingId,
            @PathVariable("actionItemId") String actionItemId) {
        
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(meetingId);
        if (meetingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Meeting meeting = meetingOpt.get();
        boolean removed = meeting.getActionItems().removeIf(item -> item.getId().equals(actionItemId));

        if (!removed) {
            return ResponseEntity.notFound().build();
        }

        meetingService.saveMeeting(meeting);
        return ResponseEntity.ok(Map.of("message", "Action item deleted successfully from meeting " + meetingId));
    }
}
