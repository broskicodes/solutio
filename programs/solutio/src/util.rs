use crate::error::SolutioError;
use crate::state::AcceptedTriggers;

use anchor_lang::prelude::*;
use clockwork_cron::Schedule;
use clockwork_sdk::state::Trigger;
use std::str::FromStr;

pub fn verify_trigger(trigger: AcceptedTriggers) -> Result<Trigger> {
    match trigger {
        AcceptedTriggers::Now => Ok(Trigger::Now),
        AcceptedTriggers::Cron { schedule_str } => {
            let schedule =
                Schedule::from_str(&schedule_str)
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
