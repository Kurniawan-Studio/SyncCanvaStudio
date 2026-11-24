import { useEffect, useState, type FormEvent } from 'react';
import { X, ArrowRight } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const cleanRoomId = roomId.trim().toUpperCase();
    const cleanName = userName.trim();
    if (cleanRoomId.length < 4 || cleanName.length === 0) return;
    onJoin({
      roomId: cleanRoomId,
      password: password.trim() || undefined,
      userName: cleanName,
      userColor,
      isCreator: mode === 'create',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1C1C] p-4 font-sans">
      <div className="w-full max-w-lg border border-narka-grey bg-[#1C1C1C]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-narka-grey">
          <div className="flex items-center gap-4">
            <span className="text-xs tracking-widest uppercase text-narka-grey">Brand Identity</span>
            <div className="w-8 h-[1px] bg-narka-grey" />
            <h2 className="text-xl font-bold tracking-widest uppercase text-narka-light">
              {APP_NAME}
            </h2>
          </div>
          {canClose && onClose && (
            <button onClick={onClose} className="text-narka-grey hover:text-narka-light">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="flex gap-6 border-b border-narka-grey pb-4">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`text-xs tracking-widest uppercase pb-2 transition-colors ${
                mode === 'create' 
                  ? 'text-narka-light border-b-2 border-narka-beige' 
                  : 'text-narka-grey hover:text-narka-light'
              }`}
            >
              01 / Create Room
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`text-xs tracking-widest uppercase pb-2 transition-colors ${
                mode === 'join' 
                  ? 'text-narka-light border-b-2 border-narka-beige' 
                  : 'text-narka-grey hover:text-narka-light'
              }`}
            >
              02 / Join Room
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-narka-grey mb-2">
                Room Identifier
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="flex-1 bg-transparent border border-narka-grey px-3 py-2 text-sm font-mono text-narka-light focus:outline-none focus:border-narka-beige transition-colors rounded-none"
                  maxLength={32}
                  required
                />
                {mode === 'create' && (
                  <button
                    type="button"
                    onClick={() => setRoomId(generateRoomId())}
                    className="px-4 py-2 border border-narka-grey text-xs tracking-widest uppercase text-narka-light hover:bg-narka-light hover:text-narka-dark transition-colors rounded-none"
                  >
                    Gen
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-narka-grey mb-2">
                Access Key (Optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-narka-grey px-3 py-2 text-sm text-narka-light focus:outline-none focus:border-narka-beige transition-colors rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-narka-grey mb-2">
                Operator Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-transparent border border-narka-grey px-3 py-2 text-sm text-narka-light focus:outline-none focus:border-narka-beige transition-colors rounded-none"
                maxLength={32}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest uppercase text-narka-grey mb-2">
                Signal Color
              </label>
              <div className="flex flex-wrap gap-2">
                {USER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setUserColor(color)}
                    className={`w-6 h-6 rounded-none transition-transform ${
                      userColor === color ? 'ring-1 ring-narka-beige scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={roomId.trim().length < 4 || userName.trim().length === 0}
            className="w-full flex items-center justify-between px-4 py-3 bg-narka-beige text-narka-dark text-xs tracking-widest uppercase font-bold hover:bg-[#c4b4a6] transition-colors rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Initialize Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
