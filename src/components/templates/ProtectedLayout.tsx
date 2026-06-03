/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken, getSessionPayload } from '../../lib/auth';

export const ProtectedLayout: React.FC = () => {
  const token = getAccessToken();
  const session = getSessionPayload();

  if (!token || !session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
