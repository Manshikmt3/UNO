import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck, Flame, Plus, Ban, RotateCw, Sparkles, ShieldAlert } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-60px)] felt-radial p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Official Game Rules & Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Standard 108-card deck regulations, challenge rules, and scoring system
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 1. Objective of the Game
            </h2>
            <p>
              Be the first player to discard all of your cards in each round. Once a player empties their hand, the round ends immediately, and they are awarded points for all cards left in opponents' hands.
            </p>
          </section>

          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-amber-400 mb-2">
              2. The 108-Card Standard Deck
            </h2>
            <p className="mb-2">A complete UNO Arena deck contains exactly 108 cards across four colors (Red, Blue, Green, Yellow):</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
              <li>1x Zero card per color (4 cards)</li>
              <li>2x Number cards 1 through 9 per color (72 cards)</li>
              <li>2x Skip cards per color (8 cards)</li>
              <li>2x Reverse cards per color (8 cards)</li>
              <li>2x Draw Two (+2) cards per color (8 cards)</li>
              <li>4x Wild cards (4 cards)</li>
              <li>4x Wild Draw Four (+4) cards (4 cards)</li>
            </ul>
          </section>

          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-amber-400 mb-2">
              3. Special Action Cards & 2-Player Mechanics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-red-400 flex items-center gap-1 mb-1">
                  <Ban className="w-4 h-4" /> Skip
                </strong>
                The next player in turn order forfeits their turn.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-blue-400 flex items-center gap-1 mb-1">
                  <RotateCw className="w-4 h-4" /> Reverse
                </strong>
                Reverses direction (clockwise to counter-clockwise). In a 2-player game, Reverse behaves as a Skip!
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 flex items-center gap-1 mb-1">
                  <Plus className="w-4 h-4" /> Draw Two (+2)
                </strong>
                The next player draws 2 cards and is skipped.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-amber-400 flex items-center gap-1 mb-1">
                  <Sparkles className="w-4 h-4" /> Wild & Wild Draw Four
                </strong>
                Playable on any card. Wild +4 adds 4 cards to the next player's hand and changes color.
              </div>
            </div>
          </section>

          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" /> 4. Wild Draw Four Challenge Rule
            </h2>
            <p className="text-xs mb-2">
              Under official tournament rules, you may only legally play Wild Draw Four if you do NOT have any cards in your hand matching the current active color. When played, the recipient may choose to Accept or Challenge:
            </p>
            <div className="space-y-1 text-xs">
              <p><strong className="text-emerald-400">If Challenged & Guilty:</strong> Offender must draw 4 cards and the challenger's turn continues normally without penalty.</p>
              <p><strong className="text-red-400">If Challenged & Innocent:</strong> Challenger must draw 6 cards (4 + 2 penalty) and misses their turn.</p>
            </div>
          </section>

          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" /> 5. Calling UNO & Catch Penalty
            </h2>
            <p className="text-xs">
              When you play your second-to-last card leaving only one card in your hand, you must call <strong className="text-red-400">UNO</strong>. If an opponent clicks "Catch UNO" before the next player takes their turn, the offending player is penalized 2 draw cards!
            </p>
          </section>

          <section className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-amber-400 mb-2">
              6. Official Scoring
            </h2>
            <p className="text-xs mb-2">
              The winner of each round scores points for all cards left in opponents' hands:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
              <li>Numbered cards (0-9): Face value</li>
              <li>Draw Two, Reverse, Skip: 20 points each</li>
              <li>Wild, Wild Draw Four: 50 points each</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
