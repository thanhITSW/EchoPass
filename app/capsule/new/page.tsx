import { AppHeader } from "@/components/layout/app-header";
import { CreateCapsuleForm } from "@/components/capsule/create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCapsulePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a new capsule</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCapsuleForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
