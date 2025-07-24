use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshSerialize, Debug)]
struct Counter {
    count: u32,
}

#[derive(BorshDeserialize, BorshSerialize)]
enum Instruction {
    Increment(u32),
    Decrement(u32),
}

entrypoint!(counter_program);

pub fn counter_program(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    msg!("Greating froom counter program");

    let accounts_iter = &mut accounts.iter();
    let acc = next_account_info(accounts_iter)?;

    msg!("Account info: {:?}", acc.data.borrow());

    let client_instruction = Instruction::try_from_slice(instruction_data)?;
    let mut counter = Counter::try_from_slice(&acc.data.borrow())?;

    msg!("Counter: {:?}", counter);

    match client_instruction {

        Instruction::Decrement(val) => {
            msg!("Decementing counter");
            counter.count = counter.count.saturating_sub(val);
        }
        Instruction::Increment(val) => {

            msg!("incrementing counter");

            counter.count = counter.count.saturating_add(val);
        }
    }

    counter.serialize(&mut *acc.data.borrow_mut())?;
    Ok(())
}