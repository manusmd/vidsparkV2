"use client";

import React from "react";

export function MusicSelector() {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Music</label>
      <select className="p-2 border border-border rounded">
        <option value="track1">Track 1</option>
        <option value="track2">Track 2</option>
        <option value="track3">Track 3</option>
      </select>
    </div>
  );
}
