import { supabase } from "@/lib/supabaseClient";
import { getRank } from "@/lib/getRank";

export const scoreService = {
  async saveScore(userId: string, newScore: number, success: boolean) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("scores_table")
        .select("id, score, rank")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing score:", fetchError);
        return null; // Or throw error
      }

      let updatedScore = newScore;
      let pointsChanged = 0;
      let isPositive = true;

      if (existing) {
        if (!success) {
          const currentScore = existing.score;
          let deduction = 0;
          if (currentScore < 10000) deduction = 80;
          else if (currentScore < 15000) deduction = 200;
          else if (currentScore < 20000) deduction = 300;
          else if (currentScore < 25000) deduction = 400;
          else if (currentScore < 30000) deduction = 450;
          else if (currentScore < 60000) deduction = 500;
          else if (currentScore < 100000) deduction = 550;
          else deduction = 550;

          updatedScore = Math.max(0, existing.score - deduction);
          pointsChanged = -deduction;
          isPositive = false;
        } else {
          updatedScore = existing.score + newScore;
          pointsChanged = newScore;
          isPositive = true;
        }

        const { name: rankName } = getRank(updatedScore);

        const { error: updateError } = await supabase
          .from("scores_table")
          .update({ score: updatedScore, rank: rankName })
          .eq("id", existing.id);

        if (updateError) console.error("Error updating score:", updateError);
      } else {
        const { name: rankName } = getRank(newScore);

        const { error: insertError } = await supabase
          .from("scores_table")
          .insert([
            { user_id: userId, score: newScore, rank: rankName },
          ]);

        if (insertError) console.error("Error inserting score:", insertError);
        pointsChanged = newScore;
        isPositive = true;
      }

      return { updatedScore, pointsChanged, isPositive };
    } catch (err) {
      console.error("Unexpected error saving score:", err);
      return null;
    }
  },

  async deductPoints(userId: string, amount: number) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("scores_table")
        .select("id, score, rank")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing score:", fetchError);
        return null;
      }

      if (existing) {
        const updatedScore = Math.max(0, existing.score - amount);
        const { name: rankName } = getRank(updatedScore);

        const { error: updateError } = await supabase
          .from("scores_table")
          .update({ score: updatedScore, rank: rankName })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating score:", updateError);
          return null;
        }

        return { updatedScore, pointsDeducted: amount };
      }
      return null;
    } catch (err) {
      console.error("Unexpected error deducting points:", err);
      return null;
    }
  }
};
