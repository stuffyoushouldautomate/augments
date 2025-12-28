"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { ChatInput } from "@/components/messages/ChatInput";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startTask } from "@/utils/taskUtils";
import { Model } from "@/types";
import { TaskList } from "@/components/tasks/TaskList";
import { UsageDashboard } from "@/components/usage-dashboard";
import { UserProfile } from "@/components/user-profile";
import { ApiKeyManagement } from "@/components/api-key-management";
import { WorkspaceProvisioning } from "@/components/workspace-provisioning";
import { AdminDashboard } from "@/components/admin-dashboard";


interface FileWithBase64 {
  name: string;
  base64: string;
  type: string;
  size: number;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithBase64[]>([]);
  const router = useRouter();
  const [activePopoverIndex, setActivePopoverIndex] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>("usage");
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tasks/models")
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        if (data.length > 0) setSelectedModel(data[0]);
      })
      .catch((err) => console.error("Failed to load models", err));
  }, []);

  // Close popover when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonsRef.current &&
        !buttonsRef.current.contains(event.target as Node)
      ) {
        setActivePopoverIndex(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePopoverIndex(null);
      }
    };

    if (activePopoverIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePopoverIndex]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);

    try {
      if (!selectedModel) throw new Error("No model selected");
      // Send request to start a new task
      const taskData: {
        description: string;
        model: Model;
        files?: FileWithBase64[];
      } = {
        description: input,
        model: selectedModel,
      };

      // Include files if any are uploaded
      if (uploadedFiles.length > 0) {
        taskData.files = uploadedFiles;
      }

      const task = await startTask(taskData);

      if (task && task.id) {
        // Redirect to the task page
        router.push(`/tasks/${task.id}`);
      } else {
        // Handle error
        console.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files: FileWithBase64[]) => {
    setUploadedFiles(files);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop grid layout (50/50 split) - only visible on large screens */}
        <div className="hidden h-full p-8 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Main content area */}
          <div className="flex flex-col items-center overflow-y-auto">
            <div className="flex w-full max-w-xl flex-col items-center">
              <div className="mb-6 flex w-full flex-col items-start justify-start">
                <h1 className="text-augments-gray-light-12 mb-1 text-2xl">
                  What can I help you get done?
                </h1>
              </div>

              <div className="bg-augments-gray-light-2 border-augments-gray-light-7 mb-10 w-full rounded-2xl border p-2">
                <ChatInput
                  input={input}
                  isLoading={isLoading}
                  onInputChange={setInput}
                  onSend={handleSend}
                  onFileUpload={handleFileUpload}
                  minLines={3}
                />
                <div className="mt-2">
                  <Select
                    value={selectedModel?.name}
                    onValueChange={(val) =>
                      setSelectedModel(
                        models.find((m) => m.name === val) || null,
                      )
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.name} value={m.name}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TaskList
                className="w-full"
                title="Latest Tasks"
                description="You'll see tasks that are completed, scheduled, or require your attention."
              />
            </div>
          </div>

          {/* Right side - Management Dashboard */}
          <div className="flex flex-col gap-6 px-6 pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="keys">API Keys</TabsTrigger>
                <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="usage" className="mt-4">
                <UsageDashboard className="w-full" />
              </TabsContent>
              
              <TabsContent value="profile" className="mt-4">
                <UserProfile className="w-full" />
              </TabsContent>
              
              <TabsContent value="keys" className="mt-4">
                <ApiKeyManagement className="w-full" />
              </TabsContent>
              
              <TabsContent value="workspaces" className="mt-4">
                <WorkspaceProvisioning className="w-full" />
              </TabsContent>
              
              <TabsContent value="admin" className="mt-4">
                <AdminDashboard className="w-full" />
              </TabsContent>
            </Tabs>
            
            {/* augments logo area */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Image
                  src="/augments_square.svg"
                  alt="augments Logo"
                  width={120}
                  height={120}
                  className="mx-auto mb-3"
                />
                <h2 className="text-xl font-bold text-augments-gray-light-12 mb-1">
                  augments
                </h2>
                <p className="text-augments-gray-light-11 text-xs">
                  Open-Source AI Desktop Agent
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile layout - only visible on small/medium screens */}
        <div className="flex h-full flex-col lg:hidden">
          <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pt-10">
            <div className="flex w-full max-w-xl flex-col items-center pb-10">
              <div className="mb-6 flex w-full flex-col items-start justify-start">
                <h1 className="text-augments-gray-light-12 mb-1 text-2xl">
                  What can I help you get done?
                </h1>
              </div>

              <div className="bg-augments-gray-light-2 border-augments-gray-light-5 borderw-full mb-10 rounded-2xl p-2">
                <ChatInput
                  input={input}
                  isLoading={isLoading}
                  onInputChange={setInput}
                  onSend={handleSend}
                  onFileUpload={handleFileUpload}
                  minLines={3}
                />
                <div className="mt-2">
                  <Select
                    value={selectedModel?.name}
                    onValueChange={(val) =>
                      setSelectedModel(
                        models.find((m) => m.name === val) || null,
                      )
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.name} value={m.name}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TaskList
                className="w-full"
                title="Latest Tasks"
                description="You'll see tasks that are completed, scheduled, or require your attention."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
