import React, { useState } from 'react';

type ExampleItem = {
  id?: string;
  sentence?: string;
  words?: string[];
  focusWord?: string;
  attentionScores?: number[]; // per-word
  explanation?: string;
};

type DemoProps = { examples?: ExampleItem[] };

export default function AttentionMechanismDemo({ examples: examplesProp }: DemoProps) {
  const examples = Array.isArray(examplesProp) ? examplesProp : [];
  const [activeExample, setActiveExample] = useState<number>(0);
  const [attentionScore, setAttentionScore] = useState<number>(0);

  const example: ExampleItem | undefined = examples[activeExample] ?? examples[0];
  if (!example) return null;

  const sentence = example.sentence ?? (example.words ?? []).join(' ');
  const words = example.words ?? [];
  const scores = example.attentionScores ?? [];
  const explanation = example.explanation ?? '';

  const onScoreChange = (n: number | undefined) =>
    setAttentionScore(typeof n === 'number' ? n : 0);

  const renderList = examples.map((exampleItem: ExampleItem, index: number) => {
    const key = exampleItem.id ?? String(index);
    return (
      <div key={key}>{exampleItem.focusWord ?? ''}</div>
    );
  });

  const wordChips = words.map((word: string, index: number) => {
    const score = typeof scores[index] === 'number' ? (scores[index] as number) : 0;
    return <span key={index}>{word} ({score})</span>;
  });

  return (
    <div>
      <p>{sentence}</p>
      <div>{wordChips}</div>
      <p>{explanation}</p>
    </div>
  );
}


