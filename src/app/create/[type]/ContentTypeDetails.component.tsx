import { Card } from "@/components/ui/card";

export function ContentTypeDetails({ contentType }: { contentType: any }) {
  return (
    <>
      <h1 className="text-4xl font-bold">{contentType.title}</h1>
      <p className="text-lg text-muted-foreground">{contentType.description}</p>

      {/* Examples */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Example Stories</h3>
        <ul className="list-disc pl-4 text-sm text-muted-foreground">
          {contentType.examples.map((example: string, index: number) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}
