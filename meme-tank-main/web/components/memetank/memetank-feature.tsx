'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useMemetankProgram } from './memetank-data-access';
import { MasterCreate, MasterAccount, GameCreate, GamesList, UserAccount, BuyTicketForm, SellTicketForm } from './memetank-ui';

export default function MemetankFeature() {
  const { publicKey } = useWallet();
  const { programId } = useMemetankProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="MemeTank program"
        subtitle={
          ''
        }
      >
        <p className="mb-6">
          Program ID: <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
      <div className="flex flex-wrap justify-center gap-8">
        <MasterCreate />
        <GameCreate />
        </div>
      </AppHero>
      <div className="flex flex-wrap justify-center gap-8">
        <MasterAccount />
        <UserAccount />
        <BuyTicketForm />
        <SellTicketForm />
      </div>
      <GamesList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
