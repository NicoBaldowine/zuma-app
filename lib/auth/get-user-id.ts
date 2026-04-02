let _cachedUserId: string | null = null;

export function setCurrentUserId(id: string | null) {
  _cachedUserId = id;
}

export function getCurrentUserId(): string {
  if (!_cachedUserId) throw new Error('Not authenticated');
  return _cachedUserId;
}
