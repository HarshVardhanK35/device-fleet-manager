// Finds the one existing assignment on `device` whose window overlaps
// [beginDT, endDT], excluding `excludeAssignmentId` (so editing an
// assignment doesn't conflict against itself). A device can only ever
// play one thing at a time, so at most one conflict matters per device —
// if your test data has more than one, this returns the first match.
export function findConflict(device, beginDT, endDT, excludeAssignmentId) {
  const begin = new Date(beginDT);
  const end = new Date(endDT);
  return (device.assignments || []).find((a) => {
    if (excludeAssignmentId && a._id === excludeAssignmentId) return false;
    const aBegin = new Date(a.beginDT);
    const aEnd = new Date(a.endDT);
    return begin < aEnd && end > aBegin;
  });
}

// Classifies how a conflicting assignment relates to the new window, so
// the override can either truncate one side, both sides (split into two
// fragments), or just get fully replaced.
export function classifyOverride(conflict, beginDT, endDT) {
  const newBegin = new Date(beginDT);
  const newEnd = new Date(endDT);
  const cBegin = new Date(conflict.beginDT);
  const cEnd = new Date(conflict.endDT);
  return {
    beforeNeeded: cBegin < newBegin, // conflict has a portion before the new window
    afterNeeded: cEnd > newEnd, // conflict has a portion after the new window — "resumes after"
  };
}

export function overlapRange(conflict, beginDT, endDT) {
  const newBegin = new Date(beginDT);
  const newEnd = new Date(endDT);
  const cBegin = new Date(conflict.beginDT);
  const cEnd = new Date(conflict.endDT);
  return {
    start: newBegin > cBegin ? newBegin : cBegin,
    end: newEnd < cEnd ? newEnd : cEnd,
  };
}
