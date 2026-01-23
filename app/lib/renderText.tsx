import React, {JSX} from 'react';

type TagMap = {
  [key: string]: (content: string, key: number) => JSX.Element;
};

export function renderText(
  text: string,
  tags: TagMap
): React.ReactNode[] {
  const regex = new RegExp(
    `(${Object.keys(tags)
      .map(tag => `<${tag}>.*?<\\/${tag}>`)
      .join('|')})`,
    'g'
  );

  return text.split(regex).map((part, index) => {
    for (const tag in tags) {
      const open = `<${tag}>`;
      const close = `</${tag}>`;

      if (part.startsWith(open) && part.endsWith(close)) {
        const content = part.replace(open, '').replace(close, '');
        return tags[tag](content, index);
      }
    }
    return part;
  });
}
