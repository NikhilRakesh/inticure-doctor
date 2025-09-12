import { X, Calendar, StickyNote, User } from "lucide-react";

interface Note {
  id: number;
  note: string;
  doctor: string;
  date: string;
}

interface PreviousNotesModalProps {
  onClose: () => void;
  notes: Note[];
}

export const PreviousNotesModal = ({
  onClose,
  notes,
}: PreviousNotesModalProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
              <StickyNote className="h-6 w-6 text-indigo-600" />
              Clinical Notes History
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No previous notes found
              </div>
            ) : (
              notes.map((note,index) => (
                <div
                  key={note.id}
                  className="bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 rounded-xl p-5 border border-indigo-200/70 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100/50 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-semibold text-indigo-900 mb-1.5">
                          {new Date(note.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </h4>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          Note #{index+1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                        {note.note}
                      </p>
                      <div className="flex items-center text-sm text-indigo-700">
                        <User className="h-4 w-4 mr-1.5" />
                        <span className="font-medium">Dr.</span> {note.doctor}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 cursor-pointer text-sm font-medium text-indigo-900 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
