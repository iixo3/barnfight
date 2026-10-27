import { useState, useEffect } from "react";

interface Project {
  id: number;
  contract: string;
  avatar_url: string;
}

export const useGetProjectsContract = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const projects: Project[] = [
          {
            id: 1,
            contract: "0x1234567890123456789012345678901234567890",
            avatar_url: "https://placehold.co/44x44/orange/white",
          },
          {
            id: 2,
            contract: "0xabcdef0123456789abcdef0123456789abcdef01",
            avatar_url: "https://placehold.co/44x44/blue/white",
          },
          {
            id: 3,
            contract: "0x9876543210fedcba9876543210fedcba98765432",
            avatar_url: "https://placehold.co/44x44/green/white",
          },
          {
            id: 4,
            contract: "0x2468ace02468ace02468ace02468ace02468ace0",
            avatar_url: "https://placehold.co/44x44/red/white",
          },
          {
            id: 5,
            contract: "0x13579bdf13579bdf13579bdf13579bdf13579bdf",
            avatar_url: "https://placehold.co/44x44/purple/white",
          },
          {
            id: 6,
            contract: "0xfedcba9876543210fedcba9876543210fedcba98",
            avatar_url: "https://placehold.co/44x44/yellow/black",
          },
          {
            id: 7,
            contract: "0x11223344556677889900aabbccddeeff11223344",
            avatar_url: "https://placehold.co/44x44/pink/black",
          },
          {
            id: 8,
            contract: "0xaabbccddee1122334455667788990011aabbccdd",
            avatar_url: "https://placehold.co/44x44/cyan/black",
          },
          {
            id: 9,
            contract: "0x123abc456def789ghi012jkl345mno678pqr901s",
            avatar_url: "https://placehold.co/44x44/magenta/white",
          },
          {
            id: 10,
            contract: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
            avatar_url: "https://placehold.co/44x44/lime/black",
          },
          {
            id: 11,
            contract: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
            avatar_url: "https://placehold.co/44x44/teal/white",
          },
          {
            id: 12,
            contract: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
            avatar_url: "https://placehold.co/44x44/indigo/white",
          },
          {
            id: 13,
            contract: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
            avatar_url: "https://placehold.co/44x44/maroon/white",
          },
          {
            id: 14,
            contract: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
            avatar_url: "https://placehold.co/44x44/navy/white",
          },
          {
            id: 15,
            contract: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
            avatar_url: "https://placehold.co/44x44/olive/white",
          },
          {
            id: 16,
            contract: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g",
            avatar_url: "https://placehold.co/44x44/silver/black",
          },
          {
            id: 17,
            contract: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h",
            avatar_url: "https://placehold.co/44x44/gray/white",
          },
          {
            id: 18,
            contract: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i",
            avatar_url: "https://placehold.co/44x44/black/white",
          },
          {
            id: 19,
            contract: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j",
            avatar_url: "https://placehold.co/44x44/white/black",
          },
          {
            id: 20,
            contract: "0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j9k",
            avatar_url: "https://placehold.co/44x44/brown/white",
          },
          {
            id: 21,
            contract: "0x1e2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j9k0l",
            avatar_url: "https://placehold.co/44x44/turquoise/black",
          },
          {
            id: 22,
            contract: "0x2f3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j9k0l1m",
            avatar_url: "https://placehold.co/44x44/gold/black",
          },
          {
            id: 23,
            contract: "0x3a4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j9k0l1m2n",
            avatar_url: "https://placehold.co/44x44/salmon/black",
          },
          {
            id: 24,
            contract: "0x4b5c6d7e8f9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o",
            avatar_url: "https://placehold.co/44x44/lavender/black",
          },
        ];

        setData(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { data, loading };
};
