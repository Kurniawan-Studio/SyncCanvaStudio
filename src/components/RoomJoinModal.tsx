// src/components/RoomJoinModal.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { X, Sparkles, Plus, LogIn } from 'lucide-react';
import { APP_NAME } from '../lib/constants';
import { generateRoomId, pickRandomUserColor, USER_COLORS } from '../lib/roomId';

export interface JoinConfig {
  roomId: string;
  password?: string;
  userName: string;
  userColor: string;
  isCreator: boolean;
}

interface RoomJoinModalProps {
  isOpen: boolean;
  onJoin: (config: JoinConfig) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export function RoomJoinModal({
  isOpen,
  onJoin,
  onClose,
  canClose = false,
}: RoomJoinModalProps): JSX.Element | null {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState<string>(() => generateRoomId());
  const [password, setPassword] = useState<string>('');
  const [userName, setUserName] = useState<string>(
    () => `Guest-${Math.floor(Math.random() * 9000 + 1000)}`,
  );
  const [userColor, setUserColor] = useState<string>(() => pickRandomUserColor());

  useEffect(() => {
    if (isOpen && mode === 'create') {
      setRoomId(generateRoomId());
    }
  }, [isOpen, mode]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const cleanRoomId = roomId.trim().toUpperCase();
    const cleanName = userName.trim();
    if (cleanRoomId.length < 4 || cleanName.length === 0) {
      return;
    }
    onJoin({
      roomId: cleanRoomId,
      password: password.trim() || undefined,
      userName: cleanName,
      userColor,
      isCreator: mode === 'create',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-100">{APP_NAME}</h2>
          </div>
          {canClose && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/60 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" /> Create
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'join'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> Join
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5" htmlFor="room-id">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                id="room-id"
                type="text"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
                placeholder="ROOM1234"
                maxLength={32}
                autoComplete="off"
              />
              {mode === 'create' ? (
                <button
                  type="button"
                  onClick={() => setRoomId(generateRoomId())}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 text-sm font-medium"
                >
                  New
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5" htmlFor="password">
              Password (optional)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Leave blank for an open room"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5" htmlFor="user-name">
              Display Name
            </label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Your name"
              maxLength={32}
              autoComplete="off"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-400 mb-1.5">Your Color</span>
            <div className="flex flex-wrap gap-2">
              {USER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setUserColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    userColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={roomId.trim().length < 4 || userName.trim().length === 0}
            className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition-colors"
          >
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            All data flows peer-to-peer. No servers, no accounts.
          </p>
        </form>
      </div>
    </div>
  );
}
