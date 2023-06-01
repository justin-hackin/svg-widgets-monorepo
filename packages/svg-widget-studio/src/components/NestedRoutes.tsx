import { Router, useLocation, useRouter } from 'wouter';
import React from 'react';

// as per https://github.com/molefrog/wouter#are-relative-routes-and-links-supported
export const NestedRoutes = ({ base, children }) => {
  const router = useRouter();
  const [parentLocation] = useLocation();

  const nestedBase = `${router.base}${base}`;

  // don't render anything outside of the scope
  if (!parentLocation.startsWith(nestedBase)) return null;

  // we need key to make sure the router will remount when base changed
  return (
    <Router base={nestedBase} key={nestedBase}>
      {children}
    </Router>
  );
};
