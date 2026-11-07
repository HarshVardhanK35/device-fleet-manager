import { AnyDevice, ClosingCta, Control, HowItWorks, Looks, Offline, WhatToShow } from "./LandingSections.jsx";

// Everything under the hero. It is its own file in the build (Landing.jsx
// loads it lazily), so the header and the hero paint first and these sections,
// with their mock-screen illustrations, arrive a moment later.
// Used by: pages/Landing.jsx.
function BelowFold() {
  return (
    <>
      <HowItWorks />
      <WhatToShow />
      <Offline />
      <Control />
      <Looks />
      <AnyDevice />
      <ClosingCta />
    </>
  );
}

export default BelowFold;
