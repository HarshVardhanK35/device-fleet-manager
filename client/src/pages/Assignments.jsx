import { useState, useEffect } from "react";

import { getAssignments } from "../api/assignments";

import { formatDate } from "../utils/formatDate.js";

function Assignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    async function fetchAssignments() {
      const data = await getAssignments();
      console.log(data);

      setAssignments(data);
    }
    fetchAssignments();
  }, []);

  return (
    <ul>
      {assignments.map((assignment) => (
        <li key={assignment._id}>
          Device: {assignment.deviceId.name} — Playlist:{" "}
          {assignment.playlistId.name} — Content:{" "}
          {assignment.playlistId.contentItems
            .map((content) => content.name)
            .join(", ")}{" "}
          — {formatDate(assignment.beginDT)} to{" "}
          {formatDate(assignment.endDT)}
        </li>
      ))}
    </ul>
  );
}

export default Assignments;
