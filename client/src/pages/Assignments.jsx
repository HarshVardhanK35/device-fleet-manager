import { useState, useEffect } from "react";

import { getAssignments } from "../api/assignments";

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
          Device: {assignment.deviceId.name} — Content:{" "}
          {assignment.contentIds.map((content) => content.name).join(", ")} —{" "}
          {new Date(assignment.beginDT).toLocaleString()} to{" "}
          {new Date(assignment.endDT).toLocaleString()}
        </li>
      ))}
    </ul>
  );
}

export default Assignments;
