import pandas as pd
import numpy as np
import os

class AuctionStrategyEngine:
    def __init__(self, csv_path: str):
        self.df = pd.read_csv(csv_path)
        self._normalize_features()

    def _normalize_features(self):
        """Converts raw stats into 0-1 scores so we can compare apples to apples."""
        # For Batting: Higher is better
        self.df['norm_strike_rate'] = self.df['Batting_Strike_Rate'] / self.df['Batting_Strike_Rate'].max()
        self.df['norm_boundary_pct'] = self.df['Boundary_Percentage'] / self.df['Boundary_Percentage'].max()
        self.df['norm_batting_avg'] = self.df['Batting_Average'] / self.df['Batting_Average'].max()
        
        # For Bowling: Lower is better (we invert it by subtracting from max)
        max_econ = self.df['Economy_Rate'].replace(0, np.nan).max()
        self.df['norm_economy'] = np.where(self.df['Economy_Rate'] > 0, 1 - (self.df['Economy_Rate'] / max_econ), 0)
        
        max_bowl_sr = self.df['Bowling_Strike_Rate'].replace(99.9, np.nan).max()
        self.df['norm_bowl_sr'] = np.where(self.df['Bowling_Strike_Rate'] < 99.9, 1 - (self.df['Bowling_Strike_Rate'] / max_bowl_sr), 0)

    def calculate_targets(self, needs, purse: float, slots: int, top_n: int = 10):
        """Runs the Vector Similarity algorithm."""
        results = []
        
        # The user's requested "Need Vector"
        team_vector = np.array([
            needs.need_power_hitter, 
            needs.need_anchor_batter, 
            needs.need_wicket_taker, 
            needs.need_economy_bowler
        ])
        
        for _, row in self.df.iterrows():
            # The player's actual "Capability Vector"
            player_vector = np.array([
                (row['norm_strike_rate'] + row['norm_boundary_pct']) / 2, # Power Hitter logic
                row['norm_batting_avg'],                                  # Anchor logic
                row['norm_bowl_sr'],                                      # Wicket Taker logic
                row['norm_economy']                                       # Economy logic
            ])
            
            # 1. Base Impact Score (Overall quality 0-100)
            impact_score = np.mean(player_vector) * 100
            
            # 2. Compatibility Score (Cosine Similarity)
            # How closely the player's shape matches the team's hole
            dot_product = np.dot(team_vector, player_vector)
            norm_team = np.linalg.norm(team_vector)
            norm_player = np.linalg.norm(player_vector)
            
            if norm_team == 0 or norm_player == 0:
                compatibility = 0
            else:
                compatibility = (dot_product / (norm_team * norm_player)) * 100
                
            # 3. Dynamic Max Bid Formula
            base_slot_budget = purse / max(slots, 1)
            experience_multiplier = 1.15 if row.get('has_old_experience', 0) == 1 else 1.0
            
            # You only pay top dollar if they are highly compatible AND highly impactful
            bid_limit = base_slot_budget * (compatibility / 100) * (impact_score / 100) * experience_multiplier
            
            results.append({
                "player_name": row['Player_Name'],
                "role": "Calculated from Stats", # We can merge this with your DB later
                "impact_score": round(impact_score, 1),
                "compatibility_score": round(compatibility, 1),
                "max_bid_limit": round(bid_limit, 2)
            })
            
        # Sort by best fit and return top N
        sorted_results = sorted(results, key=lambda x: x['compatibility_score'], reverse=True)
        return sorted_results[:top_n]