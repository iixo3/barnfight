"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/avatar/avatar";
import Icon from "@/shared/ui/components/icon/icon";
import Loader from "@/shared/ui/components/loaders/loader";
import { cn } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateGameSchemaType } from "../../hooks/use-create-game-form";
import { useGetProjectsContract } from "../../hooks/use-get-projects-contract";
import InputContract from "../input-contract/input-contract";
import { useGetTokens } from "@/shared/hooks/game/use-get-tokens";
import PlaceholderAvatar from "@/shared/ui/components/avatar/placeholder-avatar";
import { GameToken } from "@/shared/types/games/games";

type StageTwoProps = {
  delta: number;
};

const StageTwo: React.FC<StageTwoProps> = ({ delta }) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateGameSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contract_addresses",
  });

  const { data: projectTokens, isLoading: loading } = useGetTokens();
  const [additionalProjectTokens, setAdditionalProjectTokens] = useState<any[]>(
    []
  );

  const isSelected = useCallback(
    (contract: string) => {
      return {
        selected:
          fields.findIndex((field) => field.contract === contract) !== -1,
        index: fields.findIndex((field) => field.contract === contract),
      };
    },
    [fields]
  );

  const handleSelectProject = useCallback(
    (contract: string) => {
      const index = fields.findIndex((field) => field.contract === contract);

      if (index !== -1) {
        remove(index);
      } else {
        append({ contract });
      }
    },
    [append, fields, remove]
  );

  const handleAppendAdditionalProjectsTokens = useCallback(
    (projectToken: any) => {
      setAdditionalProjectTokens((prev) => [projectToken, ...prev]);
      handleSelectProject(projectToken?.address);
    },
    [handleSelectProject]
  );

  useEffect(() => {
    setValue("contract_addresses", []);
  }, []);

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col gap-y-9"
    >
      <div className="flex flex-col gap-y-2">
        <span className="text-white handjet-bold-20">Select teams</span>
        <span className="text-text-secondary aeonik-light-13">
          Choose 1 to 6 teams for the competition to begin.
        </span>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <Icon icon="plus-icon-inner-square" width={20} height={20} />
            <span className="text-white handjet-bold-20">Add Contract</span>
          </div>
          <span className="text-text-secondary aeonik-light-13">
            You can add any token listed on Raydium or Pump.Fun to the contest
            to compete against other projects.
          </span>
        </div>

        {/* TODO: cand se face loading, disable pe input */}
        <InputContract
          handleAppendAdditionalProjectsTokens={
            handleAppendAdditionalProjectsTokens
          }
        />
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2 w-full">
          <div className="max-h-[218px] min-h-[218px] h-full overflow-y-scroll no-scrollbar w-full grid grid-cols-6 gap-2">
            {loading ? (
              <div className="col-span-6 flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <AnimatePresence>
                {additionalProjectTokens &&
                  additionalProjectTokens.length > 0 &&
                  additionalProjectTokens.map((project: any, index: number) => (
                    <ProjectTokenItem
                      project={project}
                      handleSelectProject={handleSelectProject}
                      isSelected={isSelected}
                      key={index}
                    />
                  ))}
                {projectTokens?.map((project: any, index: number) => (
                  <ProjectTokenItem
                    project={project}
                    handleSelectProject={handleSelectProject}
                    isSelected={isSelected}
                    key={index}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {errors?.contract_addresses && (
            <span className="text-brand-gradient-red-1 handjet-bold-13">
              {errors?.contract_addresses?.message}
            </span>
          )}
        </div>

        {fields?.length > 0 && (
          <div>
            <span className="aeonik-light-13 text-text-secondary">
              {fields?.length} selected
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface ProjectTokenItemProps {
  project: GameToken;
  handleSelectProject: (contract: string) => void;
  isSelected: (contract: string) => {
    selected: boolean;
    index: number;
  };
}

const ProjectTokenItem: React.FC<ProjectTokenItemProps> = ({
  project,
  handleSelectProject,
  isSelected,
}) => {
  return (
    <motion.div
      key={project?.address}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={() => handleSelectProject(project?.address)}
    >
      <div className="relative">
        <Avatar
          className={cn(
            "w-[44px] h-[44px] cursor-pointer border-2 border-transparent",
            isSelected(project?.address).selected && "border-white"
          )}
        >
          <AvatarImage src={project?.logoURI} />
          <AvatarFallback>
            <PlaceholderAvatar />
          </AvatarFallback>
        </Avatar>

        {isSelected(project?.address).selected && (
          <div className="w-4 h-4 rounded-full bg-white absolute bottom-0 right-0 flex items-center justify-center">
            <span className="text-background handjet-bold-16">
              {isSelected(project?.address).index + 1}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StageTwo;
