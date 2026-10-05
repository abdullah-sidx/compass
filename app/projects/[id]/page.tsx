import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getProjects } from "@/lib/data";
import ProjectDetailClient from "@/components/projects/ProjectDetailClient";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const projects = getProjects();
  return projects.map((p) => ({
    id: p.id,
  }));
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
