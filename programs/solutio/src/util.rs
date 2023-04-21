use crate::error::SolutioError;
use crate::state::{AcceptedTriggers, PROGRAM_SERVICE_FEE_BASIS_POINTS};

use anchor_lang::prelude::*;
use clockwork_cron::Schedule;
use clockwork_sdk::state::Trigger;
use std::str::FromStr;

pub fn verify_trigger(trigger: AcceptedTriggers) -> Result<Trigger> {
    match trigger {
        AcceptedTriggers::Now => Ok(Trigger::Now),
        AcceptedTriggers::Cron { schedule_str } => {
            let schedule = Schedule::from_str(&schedule_str)
                .ok()
                .ok_or(SolutioError::InvalidScheduleString)?;

            Ok(Trigger::Cron {
                schedule: schedule.to_string(),
                skippable: false,
            })
            // Ok(Trigger::Now)
        }
    }
}

pub fn calculate_fee(amount: u64) -> Result<u64> {
    let fee = amount
      .checked_mul(PROGRAM_SERVICE_FEE_BASIS_POINTS as u64)
      .and_then(|prod| prod.checked_div(10000))
      .ok_or(SolutioError::NumericalOverflow)?;

    Ok(fee)
}